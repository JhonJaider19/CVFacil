import { createClient } from "@insforge/sdk";

const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_URL;
const anonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("Missing InsForge credentials in .env");
}

export const insforge = createClient({
  baseUrl,
  anonKey,
});
