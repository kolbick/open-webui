# figma-generate-design

A Cursor plugin that adds the `figma-generate-design` skill — a workflow for creating or updating full-page Figma screens by **reusing a published design system** (components, variables, and styles) rather than drawing primitives with hardcoded values.

## What it provides

- `skills/figma-generate-design/SKILL.md` — full workflow: discover components/variables/styles, build a page wrapper, compose one section per `use_figma` call, validate with screenshots, and optionally pair with `generate_figma_design` for pixel-perfect web-app captures (including image transfer via `imageHash`).

## Prerequisites

- Figma MCP server must be connected in Cursor.
- Load the [`figma-use`](https://docs.cursor.com) skill alongside this one — it contains the mandatory rules for every `use_figma` call.
- Source file/key with a published design system, and the source code or description of the screen to build.

## Trigger scenarios

The skill activates automatically when the user asks to:

- "write to Figma", "create in Figma from code", "push page to Figma"
- "take this app/page and build it in Figma", "create a screen", "build a landing page in Figma"
- "update the Figma screen to match code"

## Install

Place this directory at:

```
~/.cursor/plugins/local/figma-generate-design/
```

Cursor will pick it up automatically on next restart.

## License

MIT
