# 🔊 Kokoro Web - Free AI Voice Generator

**Kokoro Web** is a powerful, browser-based AI voice generator that lets you create natural-sounding voices without installing anything.

> Use it directly in your browser or self-host it for your own applications with OpenAI compatibility!

## 🎬 Demo

**Try it now:** [https://voice-generator.pages.dev](https://voice-generator.pages.dev)

## ✨ Key Features

- **Zero Installation** - Works directly in your browser, no downloads needed
- **Free & Open Source** - 100% free for personal and commercial use
- **Multiple Languages** - Support for various language accents
- **Voice Customization** - Simple and advanced voice configuration options
- **OpenAI Compatible API** - Self-host and use with existing OpenAI integrations
- **WebGPU Acceleration** - Utilize your GPU for faster generation in supported browsers

## 🚀 Usage

### Option 1: Use it online

Visit our hosted version at [voice-generator.pages.dev](https://voice-generator.pages.dev) and start generating voices instantly!

### Option 2: Self-host with Docker

The self-hosted version includes an OpenAI-compatible API that works as a drop-in replacement for applications using OpenAI's text-to-speech API.

#### Simple Docker run:

```bash
# Pull the Docker image
docker pull ghcr.io/eduardolat/kokoro-web:latest

# Run the container
docker run -p 3000:3000 -e KW_SECRET_API_KEY=your-api-key ghcr.io/eduardolat/kokoro-web:latest
```

#### Docker Compose (recommended):

```yaml
version: '3'

services:
  kokoro-web:
    image: ghcr.io/eduardolat/kokoro-web:latest
    ports:
      - "3000:3000"
    environment:
      - KW_SECRET_API_KEY=your-api-key
    volumes:
      - ./kokoro-cache:/kokoro/cache  # Cache downloaded models and voices
    restart: unless-stopped
```

Then access the web UI at http://localhost:3000 and the API at http://localhost:3000/api/v1

## ⚙️ Configuration Options

Create a `.env` file with these options:

- **KW_SECRET_API_KEY** - Your API key for authentication
  - If left blank, authentication will not be activated
  - Example: `KW_SECRET_API_KEY=some-secure-key`

- **KW_PUBLIC_NO_TRACK** - Opt out of anonymous usage analytics
  - Default: `false`
  - Set to `true` to disable analytics
  - Example: `KW_PUBLIC_NO_TRACK=true`

## 🔌 API Integration

Kokoro Web provides an OpenAI-compatible API that works as a drop-in replacement for applications using OpenAI's text-to-speech service:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://your-kokoro-host/api/v1',
  apiKey: 'your-kokoro-api-key',
});

const mp3 = await openai.audio.speech.create({
  model: 'kokoro-model',
  voice: 'af_alloy',
  input: 'Hello, this is Kokoro Web speaking!',
});
```

## 🧠 Model

Kokoro Web is powered by [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), an 82 million parameter Text-to-Speech model available on Hugging Face. Special thanks to the model creators for making this technology accessible.

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/eduardolat/kokoro-web.git
cd kokoro-web

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📜 License

Kokoro Web is [MIT Licensed](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://eduardo.lat?utm_source=github&utm_medium=readme&utm_campaign=kokoro-web">Eduardo Lat</a>
</p>
