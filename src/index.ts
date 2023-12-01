import { Hono } from "hono";
import { cors } from "hono/cors";
import { Ai } from "@cloudflare/ai";
import { Bindings } from "./types/bindings";
import { Buffer } from "buffer";
import streamOpenAI from "./gpt";

const ssePrefix = "data:";
const sseEnd = `${ssePrefix} [DONE]`;
const models: any[] = [
  "text-davinci-002-render-sha", // openai
  "@cf/mistral/mistral-7b-instruct-v0.1",
  "@cf/meta/llama-2-7b-chat-fp16",
  "@cf/meta/llama-2-7b-chat-int8",
];
const app = new Hono<{ Bindings: Bindings }>();
app.use("*", cors());
app.get("/", async (c) => {
  const ai = new Ai(c.env.AI);
  const modelIndex = Number(c.req.query("model"));
  const response = await ai.run(models[modelIndex] || models[1], {
    // prompt: c.req.query('model') || "Hi",
    messages: [
      // { role: 'system', content: 'You are a helpful assistant and you always respond my question with Chinese.' },
      { role: "user", content: c.req.query("prompt") || "Hi" },
    ],
    stream: true,
  });
  return c.stream(
    async (stream) => {
      for await (const chunk of response) {
        const str = Buffer.from(chunk).toString("utf-8");
        if (str != sseEnd) {
          const jsonstring = str.substring(ssePrefix.length);
          const resObj = JSON.parse(jsonstring);
          console.log("response", resObj.response);
          await stream.write(resObj.response);
        }
      }
      // await stream.pipe(response);
    },
    { headers: { "Content-Type": "text/plain" } },
  );
});

app.post("/", async (c) => {
  const modelIndex = Number(c.req.query("model"));
  const body = await c.req.json();
  const messages = body["messages"];
  if (modelIndex === 0 || !modelIndex) {
    return streamOpenAI(
      c.env.GPT_BASE as string,
      c.env.API_KEY as string,
      models[0],
      messages,
    );
  }
  const ai = new Ai(c.env.AI);
  const response = await ai.run(
    models[modelIndex], // modelIndex > 0, use LLAMA
    {
      messages,
      stream: true,
    },
  );
  return c.stream(
    async (stream) => {
      for await (const chunk of response) {
        const str = Buffer.from(chunk).toString("utf-8");
        if (str != sseEnd) {
          const jsonstring = str.substring(ssePrefix.length);
          const resObj = JSON.parse(jsonstring);
          await stream.write(resObj.response);
        }
      }
    },
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
});

// test gpt api
app.post("/gpt", async (c) => {
  const body = await c.req.json();
  const messages = body["messages"];
  return streamOpenAI(
    c.env.GPT_BASE as string,
    c.env.API_KEY as string,
    models[0],
    messages,
  );
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
