# Implementation Developer Memory

## Project: OpenClaw UI

### Design System
- **Color Scheme:** Premium gold accent (`#c9a84c`) on near-black backgrounds (`#0a0a0a`)
- **CSS Variables:** Uses CSS custom properties for theming (see `src/app/globals.css`)
- **Typography:** Inter font family, rgba-based text colors for opacity levels
- **Shadows:** Refined luxury shadows, glass morphism effects with backdrop-filter

### Component Patterns
- **State Management:** Zustand store at `src/stores/app-store.ts` with persist middleware
- **Animations:** Framer Motion for page transitions and component animations
- **API Client:** `apiUrl()` helper in `src/lib/config.ts` prepends BASE_PATH
- **Styling:** Inline styles with CSS variables + Tailwind utility classes
- **Icons:** Lucide React for consistent iconography

### Session Key Format
- Primary agent: `agent:primary:{agentId}`
- Navigator: `navigator:primary`
- IMPORTANT: Migrated from 'main' to 'primary' as session identifier

### File Organization
- **Views:** `src/components/views/` — Full page views (agents, chat, chats, settings, etc.)
- **Layout:** `src/components/layout/` — Shell components (sidebar, header, bottom-nav, navigator-sidebar)
- **UI:** `src/components/ui/` — Reusable UI primitives (button, card, modal, etc.)
- **Lib:** `src/lib/` — Utilities (auth, config, markdown, openclaw-api, utils)
- **Stores:** `src/stores/` — Zustand state management

### API Endpoints
- `/api/sessions` — Conversation CRUD
- `/api/sessions/history` — Load chat history
- `/api/sessions/send` — Send message
- `/api/agents` — Agent management
- `/api/skills` — Skills list
- `/api/navigator/missions` — Browser control commands

### Common Patterns

#### Creating a New View Component
```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { apiUrl } from "@/lib/config";

export function MyView() {
  const { someState } = useAppStore();
  // Component logic
  return <div style={{ background: "var(--bg-surface)" }}>...</div>;
}
```

#### Modal Pattern
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(0, 0, 0, 0.7)" }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

#### API Call Pattern
```tsx
const res = await fetch(apiUrl("/api/endpoint"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
const result = await res.json();
```

### Markdown Rendering
- Custom lightweight renderer in `src/lib/markdown.ts`
- Function: `toSanitizedLightMarkdownHtml(markdown: string)`
- XSS protection via HTML escaping
- CSS classes: `.markdown-h1`, `.markdown-bold`, `.markdown-code`, etc.
- Use with: `dangerouslySetInnerHTML={{ __html: toSanitizedLightMarkdownHtml(text) }}`

### Glass Morphism Effect
```css
background: rgba(10, 10, 10, 0.95);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
```

### Hover State Pattern
```tsx
onMouseEnter={(e) => {
  e.currentTarget.style.background = "var(--accent-primary-hover)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "var(--accent-primary)";
}}
```

### Common Pitfalls
1. **Don't forget to update CSS variables** — Colors are centralized in `globals.css`
2. **Session keys changed** — Use 'primary' not 'main'
3. **API paths need BASE_PATH** — Always use `apiUrl()` helper
4. **State not persisting** — Add fields to `partialize` in store config
5. **Animations janky** — Use GPU-accelerated properties (transform, opacity)

### Recent Changes (2024-03-03)
- Ported navigator UI redesign with gold color scheme
- Added conversation list feature (agent-bound chats)
- Created navigator sidebar for browser control
- Migrated from 'main' to 'primary' session keys
- Added markdown rendering utility
- Implemented "Chat with Agent" CTA in agents view

### Dependencies
- Next.js (App Router)
- React
- TypeScript
- Zustand (state management)
- Framer Motion (animations)
- Lucide React (icons)
- React Markdown (chat messages)
- Tailwind CSS (utility classes)
