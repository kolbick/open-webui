# Tide-Bot Live Source

This is the clean live source worktree for Tide-Bot.

## Identity

- Product/site: Tide-Bot
- Public domain: `https://tide-bot.com`
- Local app URL: `http://localhost:3001`
- Branch pushed to GitHub: `Tide-Bot`
- Current local worktree branch: `tide-bot-upstream-dev`
- App version should remain `0.9.5`

## How It Runs

The Tide-Bot Docker stack is started from this folder:

`C:\Users\sshkolby\tide-bot-live`

Compose file:

`C:\Users\sshkolby\tide-bot-live\docker-compose.tidebot.yaml`

The running app container is:

- Container: `tidebot-open-webui`
- Image: `tidebot-open-webui:local`
- Persistent DB/config: Docker volume `tidebot-webui_tidebot-open-webui`, file `/app/backend/data/webui.db`

## Provider/Tool Notes

Open WebUI stores most runtime settings in `/app/backend/data/webui.db`, not only `.env`. When provider/tool settings look wrong, inspect the DB config JSON before changing source.

Expected provider shape after the May 2026 repair:

- OpenAI-compatible providers: MiniMax and OpenAI
- Do not re-add the blocked Gemini OpenAI-compatible provider to the OpenAI provider list
- Image generation uses Gemini direct image configuration
- Web search uses Ollama Cloud web search

## Before Changing

Check both Git and live Docker state:

```powershell
git status --short
docker ps --filter name=tidebot-open-webui --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

After changes, rebuild from this folder:

```powershell
docker compose -f C:\Users\sshkolby\tide-bot-live\docker-compose.tidebot.yaml up -d --build tidebot-open-webui
```

Then verify:

```powershell
docker exec tidebot-open-webui python -c "import json,pathlib; d=json.loads(pathlib.Path('/app/package.json').read_text()); print(d['name'], d['version'])"
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:3001 -TimeoutSec 20
```
