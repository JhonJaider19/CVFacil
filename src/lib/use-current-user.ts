import { useAuth } from "./auth-context";
import { insforge } from "./insforge";

export async function resolveCurrentUserId(): Promise<string | null> {
  try {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const sdkId = authData?.user?.id;
    if (sdkId) return sdkId;
  } catch {
    // fall through to context fallback
  }
  return null;
}

export function useCurrentUserId(): () => Promise<string | null> {
  const { user } = useAuth();
  return async () => {
    const sdkId = await resolveCurrentUserId();
    return sdkId ?? user?.id ?? null;
  };
}