import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { Ai, modelMappings } from "@cloudflare/ai";
import { Bindings } from "./types/bindings";
import streamOpenAI from "./gpt";
import gemini from "./gemini";
import workerAI from "./cf";

const MODELS: any[] = [
  "text-davinci-002-render-sha", // openai
  "gemini-pro", // google
  ...modelMappings["text-generation"].models,
];

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors());

app.get("/models", async (c) => {
  return c.json(MODELS);
});

app.get("/translate", async (c) => {
  const ai = new Ai(c.env.AI);
  const inputs = {
    text: c.req.query("text") || "翻译",
    source_lang: "chinese",
    target_lang: "english",
  };
  const response = await ai.run("@cf/meta/m2m100-1.2b", inputs);
  return c.json({ inputs, response });
});

app.get("/diffusion", async (c) => {
  const ai = new Ai(c.env.AI);
  const inputs = {
    prompt: c.req.query("text") || "cat",
  };
  const response = await ai.run(
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    inputs,
  );
  return new Response(response, {
    headers: {
      "content-type": "image/png",
    },
  });
});

app.get("/", async (c) => {
  const modelIndex = Number(c.req.query("model"));
  const messages = [{ role: "user", content: c.req.query("prompt") || "Hi" }];
  return workerAI(c, MODELS[modelIndex] || MODELS[2], messages);
});

const handleMessagesWithIndex = async (
  c: Context,
  messages: [],
  modelIndex: keyof [],
) => {
  // gpt 0
  if (modelIndex === 0) {
    return streamOpenAI(
      c.env.GPT_BASE as string,
      c.env.GPT_API_KEY as string,
      MODELS[modelIndex],
      messages,
    );
  }
  // gemini 1
  if (modelIndex === 1) {
    return gemini(c.env.GOOGLE_API_KEY as string, MODELS[modelIndex], messages);
  }
  // cloudflare workers ai
  return workerAI(c, MODELS[modelIndex], messages);
};

app.post("/", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  const modelIndex = Number(body["modelIndex"]) || 0;
  return handleMessagesWithIndex(c, messages, modelIndex);
});

app.post("/gpt", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  return handleMessagesWithIndex(c, messages, 0);
});

app.post("/gemini", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  return handleMessagesWithIndex(c, messages, 1);
});

app.onError((e, c) => {
  console.error(e);
  return c.json(
    {
      status: "error",
      error: e.message,
    },
    500,
  );
});

export default app;
