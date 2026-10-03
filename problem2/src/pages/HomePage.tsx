import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { TokenSelect } from '@/components/common/TokenSelect';
import { Spinner } from '@/components/ui/spinner';
import { useTokens } from '@/hooks/queries';
import { computeOutputAmount, formatAmount, getBalance, getExchangeRate } from '@/lib/swap';
import { cn } from '@/utils/cn';
import { useWalletStore } from '@/stores';
import { swapService } from '@/services';

interface SwapFormInputs {
  inputAmount: number;
  fromCurrency: string;
  toCurrency: string;
}

const initialState = {
  inputAmount: 0,
  fromCurrency: '',
  toCurrency: '',
};

function HomePage() {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SwapFormInputs>({
    defaultValues: initialState,
    mode: 'all',
  });

  const { data: tokens = {}, isLoading, isError, refetch } = useTokens();

  const balances = useWalletStore((s) => s.balances);
  const applySwap = useWalletStore((s) => s.applySwap);
  const resetWallet = useWalletStore((s) => s.resetWallet);
  const [inputAmount, fromCurrency, toCurrency] = useWatch({
    control,
    name: ['inputAmount', 'fromCurrency', 'toCurrency'],
  });

  const fromBalance = getBalance(balances, fromCurrency);

  // Derived from the form + prices on every render; it's not form state.
  const exchangeRate = getExchangeRate(
    tokens[fromCurrency]?.price ?? 0,
    tokens[toCurrency]?.price ?? 0,
  );
  const outputAmount = computeOutputAmount(inputAmount, exchangeRate);

  const disabledButton =
    isSubmitting ||
    !fromCurrency ||
    !toCurrency ||
    !(inputAmount > 0) ||
    !(outputAmount > 0) ||
    Object.keys(errors).length > 0;

  const onSubmit: SubmitHandler<SwapFormInputs> = async (data) => {
    try {
      const receipt = await swapService.executeSwap({
        from: data.fromCurrency,
        to: data.toCurrency,
        amountIn: data.inputAmount,
        amountOut: outputAmount,
      });
      applySwap(receipt);
      toast.success(
        `Swapped ${formatAmount(receipt.amountIn)} ${receipt.from} → ${formatAmount(receipt.amountOut)} ${receipt.to}`,
        { description: `Tx ${receipt.txId.slice(0, 8)}…` },
      );
      reset(initialState);
    } catch (error) {
      toast.error('Swap failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const tokenOptions = useMemo(
    () =>
      Object.entries(tokens).map(([currency, data]) => ({
        value: currency,
        label: (
          <div className="flex items-center gap-2">
            <img src={data.icon} alt={currency} className="h-5 w-5" />
            {currency}
          </div>
        ),
      })),
    [tokens],
  );

  const tokenPlaceholder = isLoading ? 'Loading tokens…' : 'Select...';

  return (
    <div className="flex justify-center py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-96 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
          Currency Swap
        </h2>

        {isError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            Couldn't load token prices.
            <button type="button" className="font-semibold underline" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        <Controller
          name="fromCurrency"
          control={control}
          rules={{ required: 'Select a currency', deps: ['inputAmount'] }}
          render={({ field, fieldState }) => (
            <TokenSelect
              label={'Select Currency to Swap'}
              options={tokenOptions.filter((option) => option.value !== toCurrency)}
              onChange={field.onChange}
              value={field.value}
              onMenuClose={field.onBlur}
              isClearable
              isSearchable
              disabled={isLoading || isError}
              placeholder={tokenPlaceholder}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Amount to Send */}
        <div className="flex flex-col gap-1">
          <label
            className="block whitespace-nowrap text-slate-700 dark:text-slate-300"
            htmlFor="inputAmount"
          >
            Amount to Send
          </label>
          {fromCurrency && (
            <span className="truncate text-sm text-slate-500 dark:text-slate-400">
              Balance: {formatAmount(fromBalance)} {fromCurrency}
              <button
                type="button"
                className="text-brand-fg ml-2 font-semibold disabled:opacity-50"
                disabled={!(fromBalance > 0)}
                onClick={() => setValue('inputAmount', fromBalance, { shouldValidate: true })}
              >
                Max
              </button>
            </span>
          )}
          <input
            id="inputAmount"
            className={cn(
              'w-full rounded-lg border border-slate-300 bg-white p-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900',
              errors.inputAmount
                ? 'border-red-500 focus:border-red-500!'
                : 'focus:ring-brand-500 border-slate-300 focus:ring-2',
            )}
            placeholder="Enter amount"
            inputMode="decimal"
            {...register('inputAmount', {
              valueAsNumber: true,
              required: 'Amount is required',
              validate: {
                positive: (v) => (Number.isFinite(v) && v > 0) || 'Enter a valid amount',
                enoughBalance: (v, { fromCurrency }) =>
                  !fromCurrency ||
                  v <= getBalance(useWalletStore.getState().balances, fromCurrency) ||
                  `Insufficient ${fromCurrency} balance`,
              },
            })}
          />
          {errors.inputAmount && (
            <p className="text-sm text-red-500">{errors.inputAmount.message}</p>
          )}
        </div>

        {/* Select Currency to Swap To */}
        <Controller
          name="toCurrency"
          control={control}
          rules={{ required: 'Select a currency' }}
          render={({ field, fieldState }) => (
            <TokenSelect
              label={'Select Currency to Swap to'}
              options={tokenOptions.filter((option) => option.value !== fromCurrency)}
              onChange={field.onChange}
              value={field.value}
              onMenuClose={field.onBlur}
              isClearable
              isSearchable
              disabled={isLoading || isError}
              placeholder={tokenPlaceholder}
              error={fieldState.error?.message}
            />
          )}
        />

        {/* Amount to Receive */}
        <label className="block text-slate-700 dark:text-slate-300" htmlFor="outputAmount">
          Amount to Receive
        </label>
        <input
          id="outputAmount"
          type="text"
          className="mb-6 w-full rounded-lg border border-slate-300 bg-slate-100 p-3 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          value={formatAmount(outputAmount)}
          readOnly
        />

        {/* Confirm Swap Button */}
        <button
          type="submit"
          className={`w-full rounded-lg p-3 font-semibold text-white transition-all ${
            disabledButton
              ? 'cursor-not-allowed bg-slate-400 dark:bg-slate-700'
              : 'bg-brand-600 hover:bg-brand-700'
          }`}
          disabled={disabledButton}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <Spinner className="size-5" />
              Swapping...
            </div>
          ) : (
            'Confirm Swap'
          )}
        </button>

        <button
          type="button"
          className="self-center text-sm text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
          onClick={() => {
            resetWallet();
            toast('Demo wallet reset');
          }}
        >
          Reset demo wallet
        </button>
      </form>
    </div>
  );
}

export default HomePage;
