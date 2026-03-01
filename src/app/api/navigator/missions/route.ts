import { NextRequest, NextResponse } from "next/server";

/**
 * Navigator Missions API
 *
 * Bridge endpoint for Navigator browser to push/read mission state.
 * Missions are tab groups tied to OC research goals.
 *
 * GET  - Returns all active missions
 * POST - Create or update a mission
 * DELETE - End/archive a mission
 */

interface Mission {
  id: string;
  goal: string;
  tabCount: number;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  tabs?: { id: string; url: string; title: string }[];
  synthesis?: string;
}

// In-memory store — persists across requests in the same server process.
// For production: back with SQLite or OC's memory system.
const missions: Map<string, Mission> = new Map();

export async function GET() {
  const active = Array.from(missions.values())
    .filter((m) => m.status !== "completed")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return NextResponse.json({ missions: active });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // Create a new mission
  if (action === "create") {
    const { goal } = body;
    if (!goal) {
      return NextResponse.json(
        { error: "goal is required" },
        { status: 400 }
      );
    }

    const mission: Mission = {
      id: crypto.randomUUID(),
      goal,
      tabCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tabs: [],
    };

    missions.set(mission.id, mission);
    return NextResponse.json({ mission });
  }

  // Update a mission (add tabs, change status, add synthesis)
  if (action === "update") {
    const { id, ...updates } = body;
    const existing = missions.get(id);
    if (!existing) {
      return NextResponse.json(
        { error: "mission not found" },
        { status: 404 }
      );
    }

    const updated: Mission = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      // Preserve id and action fields
      id: existing.id,
    };
    delete (updated as any).action;

    // Update tab count from tabs array if provided
    if (updates.tabs) {
      updated.tabCount = updates.tabs.length;
    }

    missions.set(id, updated);
    return NextResponse.json({ mission: updated });
  }

  // Sync tabs for a mission (Navigator pushes tab state)
  if (action === "sync-tabs") {
    const { id, tabs } = body;
    const existing = missions.get(id);
    if (!existing) {
      return NextResponse.json(
        { error: "mission not found" },
        { status: 404 }
      );
    }

    existing.tabs = tabs || [];
    existing.tabCount = existing.tabs?.length || 0;
    existing.updatedAt = new Date().toISOString();

    missions.set(id, existing);
    return NextResponse.json({ mission: existing });
  }

  // Complete a mission with synthesis
  if (action === "complete") {
    const { id, synthesis } = body;
    const existing = missions.get(id);
    if (!existing) {
      return NextResponse.json(
        { error: "mission not found" },
        { status: 404 }
      );
    }

    existing.status = "completed";
    existing.synthesis = synthesis;
    existing.updatedAt = new Date().toISOString();

    missions.set(id, existing);
    return NextResponse.json({ mission: existing });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = missions.get(id);
  if (!existing) {
    return NextResponse.json(
      { error: "mission not found" },
      { status: 404 }
    );
  }

  existing.status = "completed";
  existing.updatedAt = new Date().toISOString();
  missions.set(id, existing);

  return NextResponse.json({ ok: true });
}
