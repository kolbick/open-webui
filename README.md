# Kolb-Bot 🤖

![GitHub repo size](https://img.shields.io/github/repo-size/kolbick/open-webui)
![GitHub last commit](https://img.shields.io/github/last-commit/kolbick/open-webui?color=red)

![Kolb-Bot Banner](./static/logo-full.png)

**Kolb-Bot is a private, self-hosted AI chat interface that runs entirely on your own computer.** No subscriptions, no data sent to the cloud, no one watching your conversations. Just you and your AI — offline, fast, and fully in your control.

Think of it like having your own personal ChatGPT that lives on your PC.

---

## What does "self-hosted" mean?

It means the AI runs **on your computer**, not on someone else's server. Your conversations stay private, you don't pay per message, and it works even without internet once it's set up.

---

## What you'll need before starting

You don't need to be a developer, but you do need a few things installed first:

- **A Windows, Mac, or Linux PC** (a decent GPU helps a lot for speed — NVIDIA recommended)
- **Docker Desktop** — this is what runs Kolb-Bot in a safe, contained environment
  - Download at: https://www.docker.com/products/docker-desktop
  - Install it like any normal app, then open it and leave it running in the background
- **That's it.** Docker handles everything else.

---

## Installation

### Step 1 — Download the files

Click the green **Code** button at the top of this page, then click **Download ZIP**. Extract the folder somewhere easy to find, like your Desktop.

Or if you have Git installed, open a terminal and run:
```
git clone https://github.com/kolbick/open-webui.git
cd open-webui
```

### Step 2 — Start Kolb-Bot

Open a terminal (search "Terminal" or "Command Prompt" in your Start menu), navigate to the folder you just downloaded, and run:

**With an NVIDIA GPU (recommended for speed):**
```
docker compose -f docker-compose.yaml -f docker-compose.gpu.yaml up -d --no-build --pull never
```

**Without a GPU (CPU only, slower):**
```
docker compose up -d --no-build --pull never
```

Wait a minute or two for everything to start up.

### Step 3 — Open Kolb-Bot

Open your web browser and go to:
```
http://localhost:3000
```

That's it! You should see the Kolb-Bot interface.

---

## Downloading AI Models

Kolb-Bot needs an AI model to talk to. Think of models like different "brains" — some are faster, some are smarter, some are specialized.

**To download a model:**

1. Open Kolb-Bot at `http://localhost:3000`
2. Click your profile icon in the top-right corner
3. Go to **Settings → Models**
4. Search for a model name and click Download

**Recommended models to start with:**

| Model | Size | Good for |
|-------|------|----------|
| `gemma3:4b` | ~3 GB | Fast everyday chat |
| `llama3.2:3b` | ~2 GB | Fast, great for most tasks |
| `qwen2.5:7b` | ~5 GB | Strong reasoning |
| `mistral:7b` | ~4 GB | Balanced speed and quality |

> The bigger the model, the smarter (and slower) it tends to be. Start with a smaller one and work your way up.

---

## Accessing Kolb-Bot from Other Devices

If you have Tailscale (or are on the same Wi-Fi network), you can access Kolb-Bot from your phone, tablet, or another computer.

**On your local network:**
Find your PC's local IP address (search "What is my IP" in Windows settings, look for something like `192.168.x.x`) then open:
```
http://192.168.x.x:3000
```

**Via Tailscale:**
Find your Tailscale IP in the Tailscale app, then open:
```
http://your-tailscale-ip:3000
```

---

## Creating Custom AI Agents

One of Kolb-Bot's most powerful features is the ability to create your own specialized AI assistants — called **agents** or **models** — that run entirely on your PC.

An agent is just an AI model with a custom personality, focus area, and set of instructions. You could create a cooking assistant, a coding helper, a study buddy, or anything else you can imagine.

### How to create an agent

1. Open Kolb-Bot and click **Workspace** in the left sidebar
2. Click **Models**, then click **+ New Model**
3. Fill in the details:

   - **Name** — what you want to call your agent (e.g. "Recipe Helper")
   - **Base Model** — which downloaded model powers it (e.g. `llama3.2:3b`)
   - **System Prompt** — this is the most important part. This is where you tell the AI who it is and how it should behave.

**Example system prompt for a cooking agent:**
```
You are a friendly cooking assistant named Chef. You help users find recipes, suggest ingredient substitutions, and explain cooking techniques in simple terms. Always give clear step-by-step instructions. If someone mentions dietary restrictions, take them seriously and suggest appropriate alternatives.
```

4. Click **Save** — your agent now appears in the model selector when starting a new chat

### Tips for writing good system prompts

- **Be specific** — the more detail you give, the better it behaves
- **Give it a name and personality** — "You are Alex, a patient tutor who explains things simply"
- **Tell it what to avoid** — "Do not give medical advice. Always recommend consulting a doctor."
- **Set the tone** — "Keep responses short and casual" or "Be thorough and professional"
- **Give it knowledge** — paste in facts, rules, or context it should always know

### Adding knowledge to your agent (RAG)

You can attach documents to your agent so it can reference them in conversations — like giving it a manual to read from.

1. Go to **Workspace → Knowledge**
2. Click **+ New Knowledge Base** and give it a name
3. Upload files (PDF, Word docs, plain text, etc.)
4. When creating or editing your agent, link this knowledge base under the **Knowledge** section

Now your agent will pull from those documents when answering questions. Great for things like employee handbooks, study guides, or personal notes.

### Sharing agents

Agents you create are stored locally on your computer. To share one with someone else running Kolb-Bot:

1. Open the agent in **Workspace → Models**
2. Click the export/share icon to download it as a file
3. The other person can import it through their own **Workspace → Models** page

---

## Keeping Kolb-Bot Updated

To pull in the latest improvements, open a terminal in the Kolb-Bot folder and run:

```
git pull origin Kolb-Bot
docker build -t ghcr.io/open-webui/open-webui:main .
docker compose -f docker-compose.yaml -f docker-compose.gpu.yaml restart open-webui
```

---

## Stopping Kolb-Bot

To shut everything down cleanly:

```
docker compose -f docker-compose.yaml -f docker-compose.gpu.yaml down
```

To start it again later, use the same command from Step 2 of Installation.

---

## Troubleshooting

**"No models found" when I open Kolb-Bot**
You need to download a model first. Follow the steps in the [Downloading AI Models](#downloading-ai-models) section above.

**The page won't load at localhost:3000**
Make sure Docker Desktop is open and running. Then try the startup command again and wait 1–2 minutes before refreshing.

**It's very slow to respond**
This is usually because you're running a large model without a GPU. Try a smaller model like `gemma3:4b` or `llama3.2:3b`.

**I want to use it on my phone but can't connect**
Make sure your phone is on the same Wi-Fi network as your PC, or that you have Tailscale installed on both devices.

---

## License

This project is based on [Open WebUI](https://github.com/open-webui/open-webui) and is subject to its license terms. See [LICENSE](./LICENSE) and [LICENSE_HISTORY](./LICENSE_HISTORY) for full details.
