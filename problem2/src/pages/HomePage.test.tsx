import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INITIAL_BALANCES } from '@/lib/swap';
import { swapService, type SwapReceipt, type SwapRequest } from '@/services';
import { useWalletStore } from '@/stores';
import { renderWithProviders } from '@/test/test-utils';

import HomePage from './HomePage';

// --- Mocks: a fixed price feed, an instant swap backend, and a spy on toasts ---
vi.mock('@/services', () => ({
  tokenService: {
    getPrices: vi.fn(async () => [
      { currency: 'ETH', date: '2023-08-29T07:10:30.000Z', price: 2000 },
      { currency: 'USDC', date: '2023-08-29T07:10:30.000Z', price: 1 },
      { currency: 'ATOM', date: '2023-08-29T07:10:30.000Z', price: 10 },
    ]),
  },
  swapService: { executeSwap: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

const executeSwap = vi.mocked(swapService.executeSwap);
const receiptFor = (req: SwapRequest): SwapReceipt => ({
  ...req,
  txId: 'tx-12345678-abcd',
  executedAt: '2026-10-04T10:00:00.000Z',
});

async function chooseToken(label: string, symbol: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: new RegExp(`^${symbol}`) }));
}

async function fillSwap(from: string, to: string, amount: string) {
  const user = userEvent.setup();
  await chooseToken('Select Currency to Swap', from);
  await chooseToken('Select Currency to Swap to', to);
  const input = screen.getByLabelText('Amount to Send');
  await user.clear(input);
  await user.type(input, amount);
  return { user, input };
}

const swapButton = () => screen.getByRole('button', { name: /confirm swap|swapping/i });

beforeEach(() => {
  useWalletStore.setState({ balances: INITIAL_BALANCES });
  executeSwap.mockReset();
});

describe('Swap form', () => {
  it('shows the converted amount from live prices', async () => {
    renderWithProviders(<HomePage />);
    await fillSwap('ETH', 'USDC', '1.5');

    // 1.5 ETH × $2000 / $1 = 3000 USDC
    expect(screen.getByLabelText('Amount to Receive')).toHaveValue('3,000');
    expect(swapButton()).toBeEnabled();
  });

  it('shows the balance and fills it with Max', async () => {
    renderWithProviders(<HomePage />);
    const { user, input } = await fillSwap('ETH', 'USDC', '1');

    expect(screen.getByText(/Balance: 2\.5 ETH/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Max' }));
    expect(input).toHaveValue('2.5');
  });

  it('blocks swapping more than the balance', async () => {
    renderWithProviders(<HomePage />);
    await fillSwap('ETH', 'USDC', '3');

    expect(await screen.findByText('Insufficient ETH balance')).toBeInTheDocument();
    expect(swapButton()).toBeDisabled();
    expect(executeSwap).not.toHaveBeenCalled();
  });

  it('swaps: shows a loading state, updates the wallet and resets the form', async () => {
    let resolveSwap!: (receipt: SwapReceipt) => void;
    executeSwap.mockImplementation(
      (req) => new Promise((resolve) => (resolveSwap = () => resolve(receiptFor(req)))),
    );
    renderWithProviders(<HomePage />);
    const { user } = await fillSwap('ETH', 'USDC', '1');

    await user.click(swapButton());
    expect(await screen.findByText('Swapping...')).toBeInTheDocument();
    expect(swapButton()).toBeDisabled();

    resolveSwap(receiptFor({ from: 'ETH', to: 'USDC', amountIn: 1, amountOut: 2000 }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(executeSwap).toHaveBeenCalledWith({
      from: 'ETH',
      to: 'USDC',
      amountIn: 1,
      amountOut: 2000,
    });
    expect(useWalletStore.getState().balances).toMatchObject({ ETH: 1.5, USDC: 3000 });
    expect(screen.getByLabelText('Amount to Send')).toHaveValue('0');
  });

  it('keeps the input and the balances when the swap fails', async () => {
    executeSwap.mockRejectedValue(new Error('The network rejected the swap.'));
    renderWithProviders(<HomePage />);
    const { user, input } = await fillSwap('ETH', 'USDC', '1');

    await user.click(swapButton());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Swap failed', {
        description: 'The network rejected the swap.',
      }),
    );
    expect(input).toHaveValue('1');
    expect(useWalletStore.getState().balances).toEqual(INITIAL_BALANCES);
  });

  it('does not offer the same token on both sides', async () => {
    renderWithProviders(<HomePage />);
    const user = userEvent.setup();
    await chooseToken('Select Currency to Swap', 'ETH');

    await user.click(screen.getByRole('combobox', { name: 'Select Currency to Swap to' }));
    const list = await screen.findByRole('listbox');
    expect(within(list).queryByRole('option', { name: /^ETH/ })).not.toBeInTheDocument();
    expect(within(list).getByRole('option', { name: /^USDC/ })).toBeInTheDocument();
  });
});
