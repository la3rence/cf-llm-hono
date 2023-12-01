import { Ai } from "@cloudflare/ai";

export type Bindings = {
  GPT_BASE: string | undefined;
  API_KEY: string | undefined;
  AI: Ai;
};
