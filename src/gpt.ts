import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

export const gptStatus = async (baseURL: string, apiKey: string) => {
  const STATUS_API = `${baseURL}/chatgpt/backend-api/accounts/check`;
  const response = await fetch(STATUS_API, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response;
};

export default async function streamOpenAI(
  baseURL: string,
  apiKey: string,
  model: string,
  messages: [],
) {
  const openai = new OpenAI({
    baseURL: `${baseURL}/imitate/v1`,
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
