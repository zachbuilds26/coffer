import { COFFER_STORAGE_KEY } from "@/lib/constants";
import { emptyGrantRound, type GrantRound } from "@/lib/grant-round";

export function loadGrantRound(): GrantRound {
  if (typeof window === "undefined") return emptyGrantRound;

  try {
    const value = window.localStorage.getItem(COFFER_STORAGE_KEY);
    if (!value) return emptyGrantRound;

    const parsed = JSON.parse(value) as Partial<GrantRound>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : emptyGrantRound.name,
      purpose: typeof parsed.purpose === "string" ? parsed.purpose : "",
      declaredBudget:
        typeof parsed.declaredBudget === "string" ? parsed.declaredBudget : "",
      recipients: Array.isArray(parsed.recipients) ? parsed.recipients : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    };
  } catch {
    return emptyGrantRound;
  }
}

export function saveGrantRound(round: GrantRound): void {
  window.localStorage.setItem(COFFER_STORAGE_KEY, JSON.stringify(round));
}
