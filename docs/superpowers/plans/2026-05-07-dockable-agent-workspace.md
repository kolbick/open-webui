# Dockable Agent Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished dockable Agent workspace for the visible Playwright browser flow.

**Architecture:** Add a focused `AgentWorkspace.svelte` component that owns the visual workspace, browser frame, tabs, and mobile overlay behavior. `Chat.svelte` owns when the workspace opens and passes browser/status/terminal context into it. `BrowserArtifact.svelte` remains as a fallback inline renderer, sharing the same improved browser-frame feel.

**Tech Stack:** Svelte 5, OpenWebUI chat components, Tailwind utility classes, existing browser artifact URL helpers, existing model tool IDs and terminal stores.

---

## File Map

- Create `src/lib/components/chat/AgentWorkspace.svelte`: docked desktop panel, mobile full-screen panel, Browser/Steps/Terminal tabs.
- Modify `src/lib/components/chat/Chat.svelte`: import the workspace, track open state, auto-open for Playwright MCP, render the docked workspace next to the chat pane.
- Modify `src/lib/components/chat/Messages/BrowserArtifact.svelte`: improve fallback inline styling so old artifact messages do not look broken.
- Modify `src/lib/utils/browserArtifacts.test.ts`: verify the artifact helper still returns the relative noVNC URL.
- Mirror the finished Tidebot component and Chat/BrowserArtifact changes into `C:\Users\sshkolby\open-webui-v092-kolb-build`.

## Task 1: Browser Artifact Helper Test

**Files:**
- Test: `src/lib/utils/browserArtifacts.test.ts`

- [ ] **Step 1: Confirm the existing relative URL test exists**

Expected assertion:

```ts
expect(getDefaultBrowserArtifactUrl()).toBe(
	'/browser/vnc.html?autoconnect=1&resize=remote&path=browser/websockify#password=zL6qUhJBCVoqS9w44Goo3qjW'
);
```

- [ ] **Step 2: Run the focused test locally**

Run:

```powershell
npm run test:frontend -- src/lib/utils/browserArtifacts.test.ts
```

Expected: either PASS, or local dependency failure because `node_modules` is absent. If dependencies are absent, use the Docker build in Task 6 as compile verification.

## Task 2: Create AgentWorkspace Component

**Files:**
- Create: `src/lib/components/chat/AgentWorkspace.svelte`

- [ ] **Step 1: Create the component with explicit props**

Use these props:

```ts
export let open = false;
export let mobile = false;
export let browserUrl = '';
export let statusEntries: Array<{
	done?: boolean;
	action?: string;
	description?: string;
	urls?: string[];
	query?: string;
	hidden?: boolean;
}> = [];
export let terminalId: string | null = null;
export let onClose: () => void = () => {};
```

- [ ] **Step 2: Add tab state**

Use:

```ts
type WorkspaceTab = 'browser' | 'steps' | 'terminal';
let activeTab: WorkspaceTab = 'browser';
```

- [ ] **Step 3: Add browser controls**

Use a keyed iframe reload counter:

```ts
let iframeElement: HTMLIFrameElement | null = null;
let reloadKey = 0;

const reloadBrowser = () => {
	reloadKey += 1;
};

const openFullscreen = () => {
	iframeElement?.requestFullscreen?.();
};
```

- [ ] **Step 4: Render desktop and mobile shells**

Desktop root classes:

```svelte
<aside class="hidden @3xl:flex h-full min-h-0 w-[min(46vw,760px)] min-w-[420px] shrink-0 border-l border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/80">
```

Mobile root classes:

```svelte
<div class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950 @3xl:hidden">
```

- [ ] **Step 5: Render tabs**

Tabs should be compact buttons labelled `Browser`, `Steps`, and `Terminal`, with active state:

```svelte
class: "bg-gray-900 text-white dark:bg-white dark:text-gray-950"
```

- [ ] **Step 6: Render Browser tab**

Browser panel structure:

```svelte
<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none bg-black">
	<div class="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 bg-gray-950 px-3 text-gray-300">
		<div class="flex gap-1.5"><span class="size-2.5 rounded-full bg-red-400"></span>...</div>
		<div class="min-w-0 flex-1 truncate rounded-full bg-white/8 px-3 py-1 text-xs text-gray-400">{browserUrl}</div>
	</div>
	{#key reloadKey}
		<iframe bind:this={iframeElement} class="h-full w-full border-0" src={browserUrl} ... />
	{/key}
</div>
```

- [ ] **Step 7: Render Steps tab**

Show `statusEntries.filter((entry) => !entry.hidden)`. If empty, show `No agent steps yet.` Otherwise render a vertical list with action, description, and done state.

- [ ] **Step 8: Render Terminal tab**

If `terminalId` exists, show `Terminal selected: {terminalId}` and explain that terminal output still opens through the existing OpenWebUI terminal panel. If absent, show `No terminal selected for this model.`

## Task 3: Wire AgentWorkspace Into Tidebot Chat

**Files:**
- Modify: `src/lib/components/chat/Chat.svelte`

- [ ] **Step 1: Import the workspace and browser URL helper**

Replace the browser artifacts import with:

```ts
import {
	createBrowserArtifactFile,
	getBrowserArtifacts,
	getDefaultBrowserArtifactUrl
} from '$lib/utils/browserArtifacts';
import AgentWorkspace from './AgentWorkspace.svelte';
```

- [ ] **Step 2: Add workspace state near browser agent constants**

```ts
let agentWorkspaceOpen = false;

const openAgentWorkspace = () => {
	if (browserAgentEnabled()) {
		agentWorkspaceOpen = true;
	}
};
```

- [ ] **Step 3: Add active message/status derived values**

Use current history safely:

```ts
$: activeMessage = history?.currentId ? history.messages?.[history.currentId] : null;
$: activeStatusEntries =
	activeMessage?.statusHistory ?? [...(activeMessage?.status ? [activeMessage.status] : [])];
```

- [ ] **Step 4: Auto-open workspace on browser-agent submit**

In `submitPrompt`, inside the existing `if (browserAgentEnabled() && !hasBrowserArtifactMessage())` flow, also set:

```ts
agentWorkspaceOpen = true;
```

Also call `openAgentWorkspace()` before generation starts when `browserAgentEnabled()`.

- [ ] **Step 5: Render workspace beside chat**

Wrap the chat pane and workspace in the existing main flex layout. Insert:

```svelte
<AgentWorkspace
	open={agentWorkspaceOpen && browserAgentEnabled()}
	mobile={$mobile}
	browserUrl={getDefaultBrowserArtifactUrl()}
	statusEntries={activeStatusEntries}
	terminalId={$selectedTerminalId}
	onClose={() => (agentWorkspaceOpen = false)}
/>
```

- [ ] **Step 6: Add a visible open button when workspace is closed**

Near the input or active message controls, render a compact `Agent workspace` button only when `browserAgentEnabled()` and `!agentWorkspaceOpen`. Its click handler sets `agentWorkspaceOpen = true`.

## Task 4: Improve Inline BrowserArtifact Fallback

**Files:**
- Modify: `src/lib/components/chat/Messages/BrowserArtifact.svelte`

- [ ] **Step 1: Keep props and URL behavior unchanged**

Do not change:

```ts
export let file: BrowserArtifactFile;
$: url = getBrowserArtifactUrl(file);
```

- [ ] **Step 2: Replace card styling with the same browser-frame language**

Use a calmer shell:

```svelte
<div class="my-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-950">
```

- [ ] **Step 3: Keep fullscreen and external open controls**

Retain `requestFullscreen()` and `target="_blank"` controls.

## Task 5: Port To Kolb

**Files:**
- Create: `C:\Users\sshkolby\open-webui-v092-kolb-build\src\lib\components\chat\AgentWorkspace.svelte`
- Modify: `C:\Users\sshkolby\open-webui-v092-kolb-build\src\lib\components\chat\Chat.svelte`
- Modify: `C:\Users\sshkolby\open-webui-v092-kolb-build\src\lib\components\chat\Messages\BrowserArtifact.svelte`

- [ ] **Step 1: Copy the finished Tidebot component**

Copy `AgentWorkspace.svelte` from Tidebot to Kolb unchanged.

- [ ] **Step 2: Apply equivalent Chat.svelte changes**

Use the same imports, state, auto-open behavior, and render location.

- [ ] **Step 3: Apply equivalent BrowserArtifact.svelte changes**

Use the same fallback visual treatment.

## Task 6: Build And Deploy

**Files:**
- Docker images and running containers.

- [ ] **Step 1: Build Tidebot image**

Run:

```powershell
docker build -t tidebot-open-webui:local C:\Users\sshkolby\open-webui-tidebot
```

Expected: Vite/Svelte build completes.

- [ ] **Step 2: Build Kolb image**

Run:

```powershell
docker build -t ghcr.io/open-webui/open-webui:kolb-v0.9.2 C:\Users\sshkolby\open-webui-v092-kolb-build
```

Expected: Vite/Svelte build completes.

- [ ] **Step 3: Recreate Tidebot container**

Run:

```powershell
docker compose --env-file C:\Users\sshkolby\open-webui\.env -f C:\Users\sshkolby\open-webui-tidebot\docker-compose.tidebot.yaml up -d --no-build --force-recreate tidebot-open-webui
```

- [ ] **Step 4: Recreate Kolb container**

Run:

```powershell
docker compose -f C:\Users\sshkolby\open-webui\docker-compose.yaml -f C:\Users\sshkolby\open-webui\docker-compose.override.yaml up -d --no-build --force-recreate open-webui
```

## Task 7: Verification

**Files:**
- Running public services.

- [ ] **Step 1: Verify containers**

Run:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected: `tidebot-open-webui`, `open-webui`, and `playwright-mcp-viewer` are up; app containers become healthy.

- [ ] **Step 2: Verify app endpoints**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri https://tide-bot.com/api/version -TimeoutSec 30
Invoke-WebRequest -UseBasicParsing -Uri https://kolb-bot.com/api/version -TimeoutSec 30
```

Expected: both return `200`.

- [ ] **Step 3: Verify browser endpoints**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri https://tide-bot.com/browser/vnc.html?autoconnect=1 -TimeoutSec 30
Invoke-WebRequest -UseBasicParsing -Uri https://kolb-bot.com/browser/vnc.html?autoconnect=1 -TimeoutSec 30
```

Expected: both return `200`.

- [ ] **Step 4: Verify deployed bundle contains workspace**

Run:

```powershell
docker exec tidebot-open-webui sh -lc "grep -R 'Agent workspace' -n /app/build/_app/immutable | head"
docker exec open-webui sh -lc "grep -R 'Agent workspace' -n /app/build/_app/immutable | head"
```

Expected: both commands print matching built bundle paths.
