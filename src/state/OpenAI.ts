import OpenAI from "openai";

export function getGlobalOpenAI(): OpenAI | undefined {
  return (global as any).openai;
}

export function setGlobalOpenAI(o: OpenAI) {
  (global as any).openai = o;
}
