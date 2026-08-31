"use client";

import { useCallback, useState } from "react";
import { createStore, type Store } from "@starknet-io/get-starknet-discovery";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import { WalletAccountV6, validateAndParseAddress } from "starknet";

import { mainnetProvider } from "@/lib/strk20";
import { STARKNET_MAINNET_CHAIN_ID } from "@/lib/constants";

type WalletStatus = "idle" | "connecting" | "connected" | "unsupported" | "error";

type CofferWallet = {
  status: WalletStatus;
  address: string | null;
  account: WalletAccountV6 | null;
  message: string | null;
};

const initialWallet: CofferWallet = {
  status: "idle",
  address: null,
  account: null,
  message: null,
};

export function useWallet() {
  const [wallet, setWallet] = useState<CofferWallet>(initialWallet);

  const connectWallet = useCallback(async () => {
    setWallet({ ...initialWallet, status: "connecting" });

    try {
      const store: Store = createStore({ eip1193Adapters: [] });
      const wallets = store.getWallets();
      const walletApi = wallets[0] as WalletWithStarknetFeatures | undefined;

      if (!walletApi) {
        setWallet({
          status: "error",
          address: null,
          account: null,
          message: "No Starknet wallet was found. Install and unlock a supported wallet, then try again.",
        });
        return;
      }

      const walletRequest = walletApi.features["starknet:walletApi"].request;
      const accounts = await walletRequest({ type: "wallet_requestAccounts" });
      const address = accounts[0];
      if (!address) throw new Error("No Starknet account was returned by the wallet.");

      const chainId = await walletRequest({ type: "wallet_requestChainId" });
      if (chainId !== STARKNET_MAINNET_CHAIN_ID) {
        setWallet({
          status: "error",
          address: null,
          account: null,
          message: "Switch your wallet to Starknet mainnet, then connect again.",
        });
        return;
      }

      const account = await WalletAccountV6.connect(mainnetProvider, walletApi);
      setWallet({
        status: "connected",
        address: validateAndParseAddress(address),
        account,
        message: null,
      });
    } catch (error) {
      setWallet({
        status: "unsupported",
        address: null,
        account: null,
        message:
          error instanceof Error
            ? error.message
            : "This wallet does not expose the STRK20 privacy methods Coffer needs.",
      });
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(initialWallet);
  }, []);

  return { ...wallet, connectWallet, disconnectWallet };
}
