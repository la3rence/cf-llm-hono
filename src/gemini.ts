import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

// convert messages from the Vercel AI SDK Format to the format
// that is expected by the Google GenAI SDK
// it seems currently not support system prompt...
const buildGoogleGenAIPrompt = (messages: Message[]) => ({
  contents: messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant",
    )
    .map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    })),
});

export default async function gemini(
  apiKey: string,
  model: string,
  messages: [],
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiStream = await genAI
    .getGenerativeModel({ model })
    .generateContentStream(buildGoogleGenAIPrompt(messages));
  const stream = GoogleGenerativeAIStream(geminiStream);
  return new StreamingTextResponse(stream);
}
