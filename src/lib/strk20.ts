import { num, RpcProvider, type WalletAccountV6 } from "starknet";
import type { WALLET_API } from "@starknet-io/types-js";

import {
  STARKNET_RPC_URL,
  STRK_TOKEN_ADDRESS,
  VOYAGER_TRANSACTION_URL,
} from "@/lib/constants";

export const mainnetProvider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });

export const STRK = {
  symbol: "STRK",
  address: STRK_TOKEN_ADDRESS,
  decimals: 18,
} as const;

export type TransactionState =
  | { state: "idle" }
  | { state: "awaiting_signature"; message: string }
  | { state: "pending"; message: string; hash: string }
  | { state: "confirmed"; message: string; hash: string }
  | { state: "failed"; message: string };

export function parseTokenAmount(value: string, decimals = STRK.decimals): bigint {
  const normalized = value.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) return 0n;

  const [whole, fraction = ""] = normalized.split(".");
  const scale = 10n ** BigInt(decimals);
  return BigInt(whole) * scale + BigInt(fraction.padEnd(decimals, "0").slice(0, decimals));
}

export function formatTokenAmount(value: bigint, decimals = STRK.decimals): string {
  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = (value % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function voyagerTransactionUrl(hash: string): string {
  return `${VOYAGER_TRANSACTION_URL}${hash}`;
}

function actionAmountLabel(amount: bigint): string {
  return `${formatTokenAmount(amount)} ${STRK.symbol}`;
}

async function waitForConfirmation(hash: string): Promise<TransactionState> {
  try {
    const receipt = await mainnetProvider.waitForTransaction(hash, {
      retries: 60,
      retryInterval: 2_000,
    });
    const result = "value" in receipt ? receipt.value : receipt;
    const executionStatus =
      typeof result === "object" && result !== null && "execution_status" in result
        ? result.execution_status
        : undefined;

    if (executionStatus === "REVERTED") {
      return { state: "failed", message: "The transaction reverted on Starknet." };
    }

    return { state: "confirmed", message: "Confirmed on Starknet mainnet.", hash };
  } catch {
    return {
      state: "pending",
      message: "Submitted to Starknet. Confirmation is still pending.",
      hash,
    };
  }
}

async function invokePrivacyAction(
  account: WalletAccountV6,
  action: WALLET_API.STRK20_ACTION,
): Promise<TransactionState> {
  try {
    const response = await account.strk20InvokeTransaction([action]);
    const hash = response.transaction_hash;
    return waitForConfirmation(hash);
  } catch (error) {
    return {
      state: "failed",
      message: error instanceof Error ? error.message : "The wallet rejected the privacy action.",
    };
  }
}

/** Deposits public STRK into the shared STRK20 privacy pool. */
export async function fundShieldedBalance(
  account: WalletAccountV6,
  amount: bigint,
): Promise<TransactionState> {
  if (amount <= 0n) return { state: "failed", message: "Enter a valid STRK amount." };

  return invokePrivacyAction(account, {
    type: "deposit",
    token: STRK.address,
    amount: num.toHex(amount),
  });
}

/** Sends a private STRK20 note to a recipient that has registered a viewing key. */
export async function releasePrivateGrant(
  account: WalletAccountV6,
  recipient: string,
  amount: bigint,
): Promise<TransactionState> {
  if (amount <= 0n) return { state: "failed", message: "Enter a valid grant amount." };

  return invokePrivacyAction(account, {
    type: "transfer",
    token: STRK.address,
    amount: num.toHex(amount),
    recipient,
  });
}

export async function readShieldedStrkBalance(account: WalletAccountV6): Promise<bigint> {
  const balances = await account.strk20Balances([STRK.address]);
  const entry = balances.find(
    (balance) => balance.token.toLowerCase() === STRK.address.toLowerCase(),
  );
  return entry ? num.toBigInt(entry.balance) : 0n;
}

export function transactionDescription(kind: "fund" | "release", amount: bigint): string {
  return kind === "fund"
    ? `Funded ${actionAmountLabel(amount)} into the STRK20 pool.`
    : `Released a private grant of ${actionAmountLabel(amount)}.`;
}
