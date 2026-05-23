import type { WalletState } from "../types";

const mockWallet: WalletState = {
  mode: "mock",
  address: "GDEMO7F5FYNMANRESEARCHSWARMTESTNET000000000000000000",
  network: "TESTNET",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  balanceXlm: 100,
  message: "Demo wallet is active. No extension signature required."
};

export async function connectFreighterWallet(): Promise<WalletState> {
  try {
    const freighter = await import("@stellar/freighter-api");
    const connected = await freighter.isConnected();

    if ("error" in connected && connected.error) {
      return { ...mockWallet, message: connected.error };
    }

    if (!connected.isConnected) {
      return { ...mockWallet, message: "Freighter extension not detected. Demo wallet is active." };
    }

    const access = await freighter.requestAccess();
    if ("error" in access && access.error) {
      return { ...mockWallet, message: access.error };
    }

    const details = await freighter.getNetworkDetails();
    if ("error" in details && details.error) {
      return { ...mockWallet, message: details.error };
    }

    return {
      mode: "connected",
      address: access.address,
      network: details.network,
      networkPassphrase: details.networkPassphrase,
      rpcUrl: details.sorobanRpcUrl ?? "https://soroban-testnet.stellar.org",
      balanceXlm: 100,
      message:
        details.network === "TESTNET"
          ? "Freighter connected on Testnet."
          : `Freighter connected on ${details.network}. Switch to Testnet for the demo contract.`
    };
  } catch (error) {
    return {
      ...mockWallet,
      message: error instanceof Error ? error.message : "Freighter unavailable. Demo wallet is active."
    };
  }
}

export function getDemoWallet(): WalletState {
  return mockWallet;
}
