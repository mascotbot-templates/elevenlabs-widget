# ElevenLabs Voice Widget

> Embeddable ElevenLabs Conversational-AI voice widget with a transparent-background animated avatar, lip-synced in the browser by the MascotBot lipsync SDK. Deploy once, embed anywhere with a single script tag.

![ElevenLabs Widget](https://mascotbot-app.s3.amazonaws.com/rive-assets/og_assets/voice_widget_cover.jpg)

## What This Demonstrates

- **Embeddable widget** — deploy once, embed on any site with one `<script>` tag
- **Client-side viseme inference** — `@mascotbot/{core,react}` computes visemes in the browser; no MascotBot server in the audio path
- **Element-tap audio capture** — the ElevenLabs `<audio>` element is tapped via `createElementTap()` and streamed into the lip-sync pipeline
- **Plain ElevenLabs signed URL** — `/api/get-signed-url` mints a single-use signed URL with the server-side `xi-api-key`
- **Click-through iframe** — the widget is visible but pointer events pass through to your page
- **Transparent-background avatar** — the widget-flavored NotionGuy renders with no backdrop
- **Rive event-driven UI** — start/end calls via Rive animation buttons

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- A MascotBot API key from <https://app.mascot.bot/api-keys>
  - `mascot_dev_…` — works on `localhost` / `127.0.0.1` / `*.localhost` (no billing)
  - `mascot_pub_…` — for your allow-listed production domains
- An [ElevenLabs](https://elevenlabs.io) API key and a Conversational-AI Agent ID

## SDK install (private npm registry)

The MascotBot lipsync SDK ships from the private registry `https://npm.mascot.bot/`. A `.npmrc` is already committed; it reads the token from the `MASCOT_NPM_TOKEN` environment variable, so no secret is checked in.

Before installing, export the **same** `mascot_` key you use as the lipsync license key:

```bash
export MASCOT_NPM_TOKEN=mascot_dev_xxxxxxxxxxxxxx
```

There is no `.tgz` to download and no manual SDK step — `pnpm install` pulls `@mascotbot/core` and `@mascotbot/react` from the registry.

## Avatars

The Rive avatar file is **auto-downloaded** from the public, no-auth MascotBot Avatars API by `scripts/fetch-avatars.mjs`, which runs automatically on `predev` and `prebuild`. You do **not** supply any paid `.riv` file.

This template uses the `notion-guy-widget` avatar (artboard `Widget`, state machine `mascotStateMachine`) — the embeddable widget flavor with a transparent background. The downloaded `.riv` lands in `public/` and stays gitignored.

## Quick Start

```bash
# 1. Clone this repository, then:
export MASCOT_NPM_TOKEN=mascot_dev_xxxxxxxxxxxxxx   # same as your lipsync key
cp .env.example .env.local                          # then fill in real keys
pnpm install
pnpm dev
```

`pnpm dev` fetches the avatar, then starts Next.js. Open <http://localhost:3000>.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmascotbot-templates%2Felevenlabs-widget&env=NEXT_PUBLIC_MASCOT_KEY,ELEVENLABS_API_KEY,ELEVENLABS_AGENT_ID,MASCOT_NPM_TOKEN&envDescription=MascotBot%20lipsync%20key%2C%20ElevenLabs%20credentials%2C%20and%20the%20private-registry%20install%20token&envLink=https%3A%2F%2Fdocs.mascot.bot&project-name=elevenlabs-widget&repository-name=elevenlabs-widget)

> On Vercel, set `MASCOT_NPM_TOKEN` as a build-time environment variable so `pnpm install` can authenticate to the private registry.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MASCOT_KEY` | Browser-safe MascotBot lipsync key (`mascot_dev_…` for localhost, `mascot_pub_…` for production). Inlined into the client bundle. | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key. Server-side only — used by `/api/get-signed-url`. | Yes |
| `ELEVENLABS_AGENT_ID` | ElevenLabs Conversational-AI Agent ID. | Yes |
| `MASCOT_NPM_TOKEN` | Same `mascot_` key, exported in your shell (and set on your host) so `pnpm install` can authenticate to `https://npm.mascot.bot/`. Not read at runtime. | Install only |

## Embedding on Any Website

After deploying, add this script tag to any page:

```html
<script src="https://your-deployed-widget.vercel.app/widget-embed.js"></script>
```

### Embed Options

```html
<script
  src="https://your-widget.vercel.app/widget-embed.js"
  data-widget-width="350"
  data-widget-height="450"
  data-widget-mobile-width="280"
  data-widget-mobile-height="350"
  data-widget-mobile-breakpoint="768">
</script>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-widget-url` | Auto-detected | Override the widget URL |
| `data-widget-width` | 350 | Desktop width in pixels |
| `data-widget-height` | 450 | Desktop height in pixels |
| `data-widget-mobile-width` | Same as desktop | Mobile width in pixels |
| `data-widget-mobile-height` | Same as desktop | Mobile height in pixels |
| `data-widget-mobile-breakpoint` | 768 | Viewport width to switch to mobile |

## Architecture

```
Browser (Client)
├── /widget-embed.js — embed script (injects the click-through iframe)
├── widget page — <MascotProvider apiKey={NEXT_PUBLIC_MASCOT_KEY}>
│   ├── @elevenlabs/client Conversation — voice session
│   ├── createElementTap() — taps the ElevenLabs <audio> element
│   ├── useLipsyncStream() — feeds tapped audio to client-side inference
│   └── <Mascot stateMachine="mascotStateMachine"> — Rive renderer
│
└── /api/get-signed-url — mints an ElevenLabs signed URL (xi-api-key, server-side)
```

The click-through iframe pattern: the widget is visible but clicks pass through to your page; only the voice-chat button is interactive until a call is active. Visemes are inferred in the browser — no MascotBot endpoint is in the audio path.

## Links

- [MascotBot Documentation](https://docs.mascot.bot)
- [Support](mailto:support@mascot.bot)

## License

MIT License. See [LICENSE](./LICENSE).
