export interface SwapRequest {
  from: string;
  to: string;
  amountIn: number;
  amountOut: number;
}
export interface SwapReceipt extends SwapRequest {
  txId: string;
  executedAt: string;
}

export const swapService = {
  async executeSwap(req: SwapRequest): Promise<SwapReceipt> {
    await new Promise((r) => setTimeout(r, 1500)); // simulated network latency
    if (new URLSearchParams(location.search).has('fail')) {
      throw new Error('The network rejected the swap. Your funds were not moved.');
    }
    return { ...req, txId: crypto.randomUUID(), executedAt: new Date().toISOString() };
  },
};
