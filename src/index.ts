import { Hono } from "hono";
import { cors } from "hono/cors";
import { Ai, modelMappings } from "@cloudflare/ai";
import { Bindings } from "./types/bindings";
import streamOpenAI from "./gpt";
import gemini from "./gemini";
import workerAI from "./cf";

const models: any[] = [
  "text-davinci-002-render-sha", // openai
  "gemini-pro", // google
  ...modelMappings["text-generation"].models,
];

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors());

app.get("/models", async (c) => {
  return c.json(models);
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
  return workerAI(c, models[modelIndex] || models[2], messages);
});

app.post("/", async (c) => {
  const modelIndex = Number(c.req.query("model"));
  const body = await c.req.json();
  const messages = body["messages"];
  // gpt 0
  if (!modelIndex) {
    return streamOpenAI(
      c.env.GPT_BASE as string,
      c.env.GPT_API_KEY as string,
      models[modelIndex],
      messages,
    );
  }
  // gemini 1
  if (modelIndex === 1) {
    return gemini(c.env.GOOGLE_API_KEY as string, models[modelIndex], messages);
  }
  // cloudflare workers ai
  return workerAI(c, models[modelIndex], messages);
});

app.post("/gpt", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  return streamOpenAI(
    c.env.GPT_BASE as string,
    c.env.GPT_API_KEY as string,
    models[0],
    messages,
  );
});

app.post("/gemini", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  return gemini(c.env.GOOGLE_API_KEY as string, models[1], messages);
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
