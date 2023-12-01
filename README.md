# Hono for Cloudflare Workers AI and ChatGPT

Creat the `wrangle.toml` file for cloudflare deployment:

```toml
name = "my-llm-api"

[ai]
binding = "AI"

[vars]
API_KEY = ""
GPT_BASE = ""
```

```sh
pnpm install
pnpm run deploy
```

## Models

```txt
text-davinci-002-render-sha
@cf/mistral/mistral-7b-instruct-v0.1
@cf/meta/llama-2-7b-chat-fp16
@cf/meta/llama-2-7b-chat-int8
```

## Vercel AI SDK

This project is fully compitable with [Vercel AI SDK](https://sdk.vercel.ai/docs/api-reference/use-chat).

## Reference

- [Hono Docs](https://hono.dev/top)
