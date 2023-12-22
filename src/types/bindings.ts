import { Ai } from "@cloudflare/ai";

export type Bindings = {
  GPT_BASE: string | undefined;
  GPT_API_KEY: string | undefined;
  GOOGLE_API_KEY: string | undefined;
  AI: Ai;
};
