# Hono for Cloudflare Workers AI and ChatGPT

Creat the `wrangle.toml` file for cloudflare deployment:

```toml
name = "my-llm-api"

[ai]
binding = "AI"

[vars]
GPT_API_KEY = ""
GPT_BASE = ""
```

```sh
pnpm install
pnpm run deploy
```

## Models

```txt
"text-davinci-002-render-sha",
"gemini-pro",
"@cf/meta/llama-2-7b-chat-int8",
"@cf/mistral/mistral-7b-instruct-v0.1",
"@cf/meta/llama-2-7b-chat-fp16",
"@hf/thebloke/llama-2-13b-chat-awq",
"@hf/thebloke/zephyr-7b-beta-awq",
"@hf/thebloke/mistral-7b-instruct-v0.1-awq",
"@hf/thebloke/codellama-7b-instruct-awq"
and more...
```

## Vercel AI SDK

This project is fully compitable with [Vercel AI SDK](https://sdk.vercel.ai/docs/api-reference/use-chat).

## Reference

- [Hono Docs](https://hono.dev/top)
