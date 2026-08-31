export type RecipientStatus = "draft" | "released";

export type GrantRecipient = {
  id: string;
  label: string;
  address: string;
  amount: string;
  status: RecipientStatus;
  transactionHash?: string;
};

export type ActivityKind = "fund" | "release";

export type GrantActivity = {
  id: string;
  kind: ActivityKind;
  amount: string;
  recipientLabel?: string;
  transactionHash: string;
  createdAt: string;
};

export type GrantRound = {
  name: string;
  purpose: string;
  declaredBudget: string;
  recipients: GrantRecipient[];
  activity: GrantActivity[];
};

export const emptyGrantRound: GrantRound = {
  name: "Untitled grant round",
  purpose: "",
  declaredBudget: "",
  recipients: [],
  activity: [],
};

export function sumRecipientAllocations(recipients: GrantRecipient[]): number {
  return recipients.reduce((total, recipient) => {
    const value = Number(recipient.amount);
    return Number.isFinite(value) && value > 0 ? total + value : total;
  }, 0);
}

export function isStarknetAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(value.trim());
}

export function buildRecipient(input: Pick<GrantRecipient, "label" | "address" | "amount">): GrantRecipient {
  return {
    id: crypto.randomUUID(),
    label: input.label.trim(),
    address: input.address.trim(),
    amount: input.amount.trim(),
    status: "draft",
  };
}
