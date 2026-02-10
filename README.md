# ElevenLabs Voice Widget

> Embeddable voice chat widget powered by ElevenLabs conversational AI and Mascot Bot SDK. Deploy once, embed anywhere with a single script tag.

![ElevenLabs Widget](https://mascotbot-app.s3.amazonaws.com/rive-assets/og_assets/voice_widget_cover.jpg)

## What This Demonstrates

- **Embeddable widget** — deploy once, embed on any website with a single `<script>` tag
- **Click-through iframe** — widget is visible but clicks pass through to your page
- **Real-time lip sync** — avatar mouth movements synchronized with ElevenLabs audio
- **Character customization** — 13+ configurable appearance inputs
- **Responsive sizing** — different dimensions for mobile and desktop
- **Rive event-driven UI** — start/end calls via Rive animation buttons

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- [Mascot Bot SDK subscription](https://app.mascot.bot) (for `.tgz` package and `.riv` file)
- [ElevenLabs](https://elevenlabs.io) API key and Agent ID

## Quick Start

1. Clone this repository
2. Add the required private files (see below)
3. Configure environment variables
4. Install and run

```bash
pnpm install
pnpm dev
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmascotbot%2Felevenlabs-widget&env=MASCOT_BOT_API_KEY,ELEVENLABS_API_KEY,ELEVENLABS_AGENT_ID&envDescription=API%20keys%20required%20for%20ElevenLabs%20widget%20integration&envLink=https%3A%2F%2Fdocs.mascot.bot%2Flibraries%2Felevenlabs-widget&project-name=elevenlabs-widget&repository-name=elevenlabs-widget)

## Private Files You Need

### Mascot Bot SDK

- **File:** `mascotbot-sdk-react-X.X.X.tgz`
- **Where:** project root
- **How to get:** download from your [Mascot Bot dashboard](https://app.mascot.bot) after subscribing

```bash
cp /path/to/mascotbot-sdk-react-0.1.7.tgz ./
pnpm install
```

### Rive Widget Animation File

- **File:** `mascot_widget.riv`
- **Where:** `public/`
- **How to get:** provided with your Mascot Bot SDK subscription
- **Requirements:** must use `Widget` artboard with inputs: `is_speaking`, `is_connected`, `is_connecting`, `reveal`, `hit`, `gesture` and Rive events: `startCall`, `endCall`

```bash
cp /path/to/mascot_widget.riv ./public/
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `MASCOT_BOT_API_KEY` | Mascot Bot API key (from [app.mascot.bot](https://app.mascot.bot)) | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes |
| `ELEVENLABS_AGENT_ID` | ElevenLabs Agent ID | Yes |

## Embedding on Any Website

After deploying, add this script tag to any website:

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

## Character Customization

Customize the mascot appearance in `src/app/page.tsx`:

```typescript
const WIDGET_CUSTOMIZATION = {
  gender: 1,              // 1 = male, 2 = female
  outline: 10,            // 0-100 stroke thickness
  colourful: true,        // true = colorful, false = monochrome
  flip: false,            // Mirror the character
  crop: false,            // Show background circle
  shirt_color: 2,         // 1-6 shirt color variant
  eyes_type: 2,           // 1-2 eye style
  hair_style: 1,          // 1-3 hair style
};
```

## Architecture

The widget uses a click-through iframe pattern:
- **Default state:** Widget is visible but clicks pass through to your page
- **Button hover:** Only the voice chat button area is interactive
- **Active call:** Full widget becomes interactive during conversations

## Links

- [Mascot Bot Documentation](https://docs.mascot.bot)
- [ElevenLabs Integration Guide](https://docs.mascot.bot/libraries/elevenlabs-avatar)
- [Support](mailto:support@mascot.bot) | [Discord](https://discord.gg/SBxfyPXD)
