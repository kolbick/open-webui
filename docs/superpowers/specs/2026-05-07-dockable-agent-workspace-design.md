# Dockable Agent Workspace Design

## Goal

Replace the current browser artifact experience with a dockable Agent workspace that feels native to chat. The current live browser appears as a large iframe inside the message stream, which makes the workflow feel bolted on and visually rough. The new design should make browser automation feel like an active workspace beside the conversation.

## Selected Direction

Use the dockable agent panel direction. On desktop, chat remains the primary left pane and the Agent workspace docks on the right. The workspace has a polished header, a live status indicator, and three tabs:

- `Browser`: the visible Playwright noVNC session.
- `Steps`: the assistant status/tool timeline for the active response.
- `Terminal`: a bridge to `My Terminal` when that terminal is configured.

On mobile, the same workspace becomes a full-screen drawer opened from an Agent workspace button. This avoids squeezing chat and browser into a narrow viewport.

## Behavior

When the selected model includes `server:mcp:playwright-browser-automation`, the Agent workspace opens automatically when the user sends a message. The browser remains available while the agent is working and after the response completes, so the user can watch, interact, or open it externally. The old inline browser artifact message remains supported for compatibility, but it is no longer the primary experience.

The workspace should reuse the existing browser artifact URL helper so Tidebot and Kolb resolve the browser URL relative to their own domain. The workspace must not hardcode a bot domain.

## Components

Add `src/lib/components/chat/AgentWorkspace.svelte`.

Responsibilities:

- Render the docked desktop panel and mobile drawer shell.
- Own tab state for `Browser`, `Steps`, and `Terminal`.
- Render a refined browser frame with controls for reload, fullscreen, and open-in-new-tab.
- Render status history as a compact timeline in the Steps tab.
- Show terminal availability clearly without inventing new terminal APIs.

Update `Chat.svelte`.

Responsibilities:

- Track whether the Agent workspace is open.
- Auto-open it when the Playwright MCP tool is active and a message starts.
- Pass the active response/status context into the workspace.
- Keep existing browser artifact message handling for compatibility.

Update `BrowserArtifact.svelte`.

Responsibilities:

- Share the improved browser frame styling for fallback inline rendering.
- Keep existing artifact data shape working.

## Visual Design

The docked panel should feel like a focused browser workstation rather than a card. It should use restrained colors, stable sizing, a browser-like top bar, and clear controls. The panel should avoid nested cards and avoid dominating the entire chat unless the user expands it.

Desktop target:

- Right dock width around `min(46vw, 760px)` with a sensible minimum.
- Full available chat height.
- Smooth border, muted background, and a clear active tab state.

Mobile target:

- Full-screen overlay/drawer.
- Large browser area.
- Sticky header and tab bar.
- Easy close control.

## Error Handling

If the browser URL fails to load, the panel should still show the open-in-new-tab control and a calm fallback message. If no terminal is configured, the Terminal tab should explain that `My Terminal` is not selected for this model.

## Testing

Verification should include:

- Frontend build for Tidebot.
- Frontend build for Kolb after porting the shared component.
- Public endpoint checks for `tide-bot.com`, `kolb-bot.com`, and both `/browser` routes.
- Manual browser inspection on desktop-sized and phone-sized viewports.

## Scope

This design does not attempt to clone every ChatGPT Agent detail. It focuses on the main UX improvement: a smooth, persistent, docked workspace for visible browser automation. A more advanced task rail or richer tool-call renderer can build on this later.
