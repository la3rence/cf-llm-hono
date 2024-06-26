import { Ai } from "@cloudflare/ai";
import { Context } from "hono";
import { Buffer } from "buffer";
import { stream } from "hono/streaming";

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
    model, // models[modelIndex],
    {
      messages,
      stream: true,
    },
  );
  return stream(c, async (stream) => {
    for await (const chunk of response as any) {
      const str = Buffer.from(chunk).toString("utf-8");
      if (str != sseEnd) {
        const jsonstring = str.substring(ssePrefix.length);
        const resObj = JSON.parse(jsonstring);
        await stream.write(resObj.response);
      }
    }
  });
}
