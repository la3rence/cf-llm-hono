import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

export default async function streamOpenAI(
  baseURL: string,
  apiKey: string,
  model: string,
  messages: [],
) {
  const openai = new OpenAI({
    baseURL,
    apiKey,
  });
  const response = await openai.chat.completions.create({
    model: model,
    stream: true,
    messages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
