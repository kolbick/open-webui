# gemini-live-api-dev

A Cursor plugin that adds a single skill, `gemini-live-api-dev`, for building applications with the Gemini Live API — low-latency, real-time voice/video/text interactions over WebSockets.

## What it provides

- `skills/gemini-live-api-dev/SKILL.md` — model list, SDKs, audio formats, quick-start snippets (Python + JS), limitations, migration notes, and documentation lookup guidance.

## Trigger scenarios

The skill is loaded automatically by Cursor when a task involves any of:

- Building real-time voice/video/text apps with Gemini
- Using `gemini-3.1-flash-live-preview` (or migrating away from deprecated 2.x live models)
- Working with WebSocket sessions, transcription, VAD, tool calling, ephemeral tokens, or session resumption
- Using the `google-genai` (Python) or `@google/genai` (JS/TS) SDKs for Live API

## Install

Clone or place this directory at:

```
~/.cursor/plugins/local/gemini-live-api-dev/
```

Cursor will pick it up automatically on next restart.

## License

MIT
