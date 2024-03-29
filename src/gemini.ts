import {
  GoogleGenerativeAI,
  GenerateContentRequest,
} from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

// convert messages from the Vercel AI SDK Format to the format
// that is expected by the Google GenAI SDK
// it seems currently not support system prompt...
const buildGoogleGenAIPrompt = (messages: Message[]) => {
  // to support prompt by first user input
  if (messages[0]["role"] === "system" && messages[1]["role"] === "user") {
    messages[1]["content"] = messages[0]["content"] + messages[1]["content"];
  }
  return {
    contents: messages
      .filter(
        (message) => message.role === "user" || message.role === "assistant",
      )
      .map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
  };
};

export default async function gemini(
  apiKey: string,
  model: string,
  messages: [],
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiStream = await genAI
    .getGenerativeModel({ model })
    .generateContentStream(
      buildGoogleGenAIPrompt(messages) as GenerateContentRequest,
    );
  const stream = GoogleGenerativeAIStream(geminiStream);
  return new StreamingTextResponse(stream);
}
