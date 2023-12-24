import { Ai, modelMappings } from "@cloudflare/ai";
import { Context } from "hono";
import { Buffer } from "buffer";

const ssePrefix = "data:";
const sseEnd = `${ssePrefix} [DONE]`;

export default async function workerAI(
  c: Context,
  model: any,
  messages: any[],
) {
  console.log(c.env.AI);
  const ai = new Ai(c.env.AI);
  const response = await ai.run(
    model, // models[modelIndex], // modelIndex > 1, use LLAMA
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
}
