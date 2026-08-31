"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildRecipient,
  emptyGrantRound,
  isStarknetAddress,
  sumRecipientAllocations,
  type GrantRecipient,
  type GrantRound,
} from "@/lib/grant-round";
import { loadGrantRound, saveGrantRound } from "@/lib/storage";

type RecipientDraft = {
  label: string;
  address: string;
  amount: string;
};

export function useGrantRound() {
  const [round, setRound] = useState<GrantRound>(emptyGrantRound);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRound(loadGrantRound());
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) saveGrantRound(round);
  }, [isReady, round]);

  const updateDetails = useCallback((changes: Partial<Pick<GrantRound, "name" | "purpose" | "declaredBudget">>) => {
    setRound((current) => ({ ...current, ...changes }));
  }, []);

  const addRecipient = useCallback((draft: RecipientDraft): string | null => {
    if (!draft.label.trim()) return "Give this recipient a label.";
    if (!isStarknetAddress(draft.address)) return "Enter a valid Starknet address.";
    if (!/^\d+(\.\d+)?$/.test(draft.amount.trim()) || Number(draft.amount) <= 0) {
      return "Enter a grant amount greater than zero.";
    }

    setRound((current) => ({
      ...current,
      recipients: [...current.recipients, buildRecipient(draft)],
    }));
    return null;
  }, []);

  const removeRecipient = useCallback((recipientId: string) => {
    setRound((current) => ({
      ...current,
      recipients: current.recipients.filter((recipient) => recipient.id !== recipientId),
    }));
  }, []);

  const recordFunding = useCallback((amount: string, transactionHash: string) => {
    setRound((current) => ({
      ...current,
      activity: [
        {
          id: crypto.randomUUID(),
          kind: "fund",
          amount,
          transactionHash,
          createdAt: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
  }, []);

  const recordRelease = useCallback((recipient: GrantRecipient, transactionHash: string) => {
    setRound((current) => ({
      ...current,
      recipients: current.recipients.map((item) =>
        item.id === recipient.id
          ? { ...item, status: "released", transactionHash }
          : item,
      ),
      activity: [
        {
          id: crypto.randomUUID(),
          kind: "release",
          amount: recipient.amount,
          recipientLabel: recipient.label,
          transactionHash,
          createdAt: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
  }, []);

  const resetRound = useCallback(() => setRound(emptyGrantRound), []);

  const allocations = useMemo(() => sumRecipientAllocations(round.recipients), [round.recipients]);
  const releasedCount = useMemo(
    () => round.recipients.filter((recipient) => recipient.status === "released").length,
    [round.recipients],
  );

  return {
    round,
    isReady,
    allocations,
    releasedCount,
    updateDetails,
    addRecipient,
    removeRecipient,
    recordFunding,
    recordRelease,
    resetRound,
  };
}
