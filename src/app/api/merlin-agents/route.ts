import { NextResponse } from "next/server";
import { execSync } from "child_process";

const MERLIN_KEY = "ccw_live_zJSXOAa4p4xPI3ZRKyUo8rG2pDpiCOP0";

export async function GET() {
  try {
    // Use merlin-brain CLI to list agents via MCP
    const raw = execSync(
      `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | MERLIN_API_KEY=${MERLIN_KEY} merlin-brain 2>/dev/null || echo '{}'`,
      { timeout: 10000, encoding: "utf-8" }
    );

    // Parse the MCP response to extract agent-like tools
    const lines = raw.split("\n").filter((l) => l.trim().startsWith("{"));
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.result?.tools) {
          // Group tools by prefix to create "agent" categories
          const toolsByPrefix: Record<string, any[]> = {};
          for (const tool of parsed.result.tools) {
            const name: string = tool.name || "";
            const prefix = name.includes("_") ? name.split("_")[0] : "general";
            if (!toolsByPrefix[prefix]) toolsByPrefix[prefix] = [];
            toolsByPrefix[prefix].push({
              name: tool.name,
              description: tool.description || "",
            });
          }

          const agents = Object.entries(toolsByPrefix).map(([prefix, tools]) => ({
            id: prefix,
            name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            description: `${tools.length} tools: ${tools
              .slice(0, 3)
              .map((t) => t.name)
              .join(", ")}${tools.length > 3 ? "..." : ""}`,
            model: "merlin-brain",
            toolCount: tools.length,
            tools,
          }));

          return NextResponse.json({ agents });
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ agents: [], note: "Could not parse merlin-brain output" });
  } catch (e: any) {
    return NextResponse.json({ agents: [], error: e.message });
  }
}
