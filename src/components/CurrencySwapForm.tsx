import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { CurrencyInput } from './CurrencyInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormValues {
  fromAmount: string;
  fromToken: string;
  toToken: string;
  toAmount: string;
}

export default function CurrencySwapForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      fromAmount: '1',
      fromToken: 'BLUR',
      toToken: 'ETH',
      toAmount: '0.0001',
    },
  });

  const { data: tokens, isLoading: isLoadingPrices } = useTokenPrices();
  const [loading, setLoading] = React.useState(false);

  const handleSwapTokens = () => {
    const fromToken = form.getValues('fromToken');
    const toToken = form.getValues('toToken');
    const toAmount = form.getValues('toAmount');
    const fromAmount = form.getValues('fromAmount');
    form.setValue('fromToken', toToken);
    form.setValue('toToken', fromToken);
    form.setValue('fromAmount', toAmount);
    form.setValue('toAmount', fromAmount);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success(
      `Swapped ${data.fromAmount} ${data.fromToken} to ${data.toAmount} ${data.toToken} successfully!`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm"
        >
          <CurrencyInput
            method="from"
            tokens={tokens}
            disabled={loading || isLoadingPrices}
            required
          />

          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="rounded-full bg-gray-200 hover:bg-gray-300 p-2 shadow transition"
              disabled={loading || isLoadingPrices}
              aria-label="Swap tokens"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-violet-600"
              >
                <path d="m17 4 3 3-3 3" />
                <path d="M3 7h14" />
                <path d="m7 14-3 3 3 3" />
                <path d="M21 17H7" />
              </svg>
            </button>
          </div>

          <CurrencyInput
            method="to"
            tokens={tokens}
            disabled={loading || isLoadingPrices}
            required
          />
          <button
            type="submit"
            className="w-full py-5 mt-2 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-lg font-semibold transition disabled:opacity-60"
            disabled={loading || isLoadingPrices}
          >
            {loading || isLoadingPrices ? 'Swapping...' : `Currency Swap`}
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
