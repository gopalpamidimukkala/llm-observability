import { GroqProvider } from "./groq";

export function getProvider(
  provider: string
) {
  switch (provider) {
    case "groq":
      return new GroqProvider();

    default:
      return new GroqProvider();
  }
}