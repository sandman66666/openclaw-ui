import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const NOTION_BASE = "https://api.notion.com/v1";
const OPEN_ITEMS_PATH = path.join(process.env.HOME || "", ".openclaw/workspace/memory/open-items.json");
const HAS_NOTION = !!(NOTION_API_KEY && DATABASE_ID);

const notionHeaders = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function loadOpenItems(): any {
  try {
    return JSON.parse(fs.readFileSync(OPEN_ITEMS_PATH, "utf-8"));
  } catch {
    return { items: [] };
  }
}

function saveOpenItems(data: any) {
  fs.writeFileSync(OPEN_ITEMS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function getRossItems(): any[] {
  try {
    const data = loadOpenItems();
    return (data.items || [])
      .filter((item: any) => item.status !== "closed" && item.status !== "done")
      .map((item: any) => ({
        id: "ross-" + item.id,
        rossId: item.id,
        notionId: item.notionId,
        title: (item.emoji || "📌") + " " + item.title,
        status: item.status === "waiting" ? "In progress" : "Not started",
        dueDate: item.deadline || null,
        source: "ross",
        priority: item.priority,
      }));
  } catch {
    return [];
  }
}

async function createNotionTask(title: string, dueDate?: string): Promise<string | null> {
  const properties: any = {
    "Task name": { title: [{ text: { content: title } }] },
    "Status": { status: { name: "Not started" } },
  };
  if (dueDate) properties["Due date"] = { date: { start: dueDate } };

  const res = await fetch(`${NOTION_BASE}/pages`, {
    method: "POST",
    headers: notionHeaders,
    body: JSON.stringify({ parent: { database_id: DATABASE_ID }, properties }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id || null;
}

async function updateNotionStatus(notionId: string, status: string) {
  await fetch(`${NOTION_BASE}/pages/${notionId}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ properties: { Status: { status: { name: status } } } }),
  });
}

async function archiveNotionPage(notionId: string) {
  await fetch(`${NOTION_BASE}/pages/${notionId}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ archived: true }),
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const rossItems = getRossItems();

    if (!HAS_NOTION) {
      return NextResponse.json({ tasks: rossItems });
    }

    const res = await fetch(`${NOTION_BASE}/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        filter: { property: "Status", status: { does_not_equal: "Done" } },
      }),
    });
    const data = await res.json();
    const notionTasks = (data.results || [])
      .map((page: any) => {
        const title =
          page.properties?.["Task name"]?.title?.[0]?.plain_text ||
          page.properties?.Name?.title?.[0]?.plain_text ||
          page.properties?.Title?.title?.[0]?.plain_text ||
          "";
        if (title.startsWith("[SH]")) return null;
        const status = page.properties?.Status?.status?.name || "Not started";
        const dueDate = page.properties?.["Due date"]?.date?.start || null;
        return { id: page.id, notionId: page.id, title, status, dueDate, source: "notion" };
      })
      .filter(Boolean);

    // Merge: Ross items first (newest), then Notion-only items
    const rossNotionIds = new Set(rossItems.map((r: any) => r.notionId).filter(Boolean));
    const notionOnly = notionTasks.filter((t: any) => !rossNotionIds.has(t.id));
    return NextResponse.json({ tasks: [...rossItems, ...notionOnly] });
  } catch (e: any) {
    return NextResponse.json({ tasks: getRossItems() });
  }
}

// ── POST: add task ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { title, dueDate, id, emoji, priority } = await req.json();
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    // 1. Push to Notion (if configured)
    const notionId = HAS_NOTION ? await createNotionTask(title, dueDate) : null;

    // 2. Add to open-items.json
    const data = loadOpenItems();
    const itemId = id || title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
    data.items.unshift({
      id: itemId,
      emoji: emoji || "📌",
      title,
      created: new Date().toISOString().split("T")[0],
      priority: priority || "medium",
      nag: false,
      status: "open",
      ...(dueDate && { deadline: dueDate }),
      ...(notionId && { notionId }),
    });
    saveOpenItems(data);

    return NextResponse.json({ ok: true, notionId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── PATCH: update status ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const notionStatus = status === "Done" || status === "done" ? "Done" : status || "In progress";

    if (id.startsWith("ross-")) {
      // Update open-items.json
      const data = loadOpenItems();
      const rossId = id.replace("ross-", "");
      const item = data.items.find((i: any) => i.id === rossId);
      if (item) {
        item.status = notionStatus === "Done" ? "closed" : "open";
        const notionId = item.notionId;
        saveOpenItems(data);
        // Sync to Notion (if configured)
        if (notionId && HAS_NOTION) await updateNotionStatus(notionId, notionStatus);
      }
    } else if (HAS_NOTION) {
      // Pure Notion task
      await updateNotionStatus(id, notionStatus);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── DELETE: archive ────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    if (id.startsWith("ross-")) {
      const data = loadOpenItems();
      const rossId = id.replace("ross-", "");
      const item = data.items.find((i: any) => i.id === rossId);
      if (item) {
        item.status = "closed";
        const notionId = item.notionId;
        saveOpenItems(data);
        if (notionId && HAS_NOTION) await archiveNotionPage(notionId);
      }
    } else if (HAS_NOTION) {
      await archiveNotionPage(id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
