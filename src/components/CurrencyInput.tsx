import type { TokenPrice } from '@/hooks/useTokenPrices';
import { useFormContext, Controller } from 'react-hook-form';
import { TokenSelect } from './TokenSelect';
import { memo } from 'react';

interface CurrencyInputProps {
  tokens: TokenPrice;
  disabled?: boolean;
  required?: boolean;
  method: 'from' | 'to';
}

const calculateSwapAmount = (
  amount: string,
  fromToken: string,
  toToken: string,
  tokens: TokenPrice
): string => {
  if (!amount || isNaN(Number(amount))) return '';

  const fromTokenData = tokens.find((t) => t.currency === fromToken);
  const toTokenData = tokens.find((t) => t.currency === toToken);

  if (!fromTokenData?.price || !toTokenData?.price) return '';
  console.log('From token data price:', fromTokenData.price);
  console.log('To token data price:', toTokenData.price);
  const result = (Number(amount) * fromTokenData.price) / toTokenData.price;
  return result.toFixed(4);
};

export const CurrencyInput = memo(function CurrencyInput({
  tokens,
  method,
  disabled,
  required,
}: CurrencyInputProps) {
  const { control, setValue, getValues, formState } = useFormContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const fromToken = getValues(`${method}Token`);
    const toToken = getValues(method === 'from' ? 'toToken' : 'fromToken');
    if (value === '' || parseFloat(value) >= 0) {
      setValue(`${method}Amount`, value);
      const newAmount = calculateSwapAmount(value, fromToken, toToken, tokens);
      if (method === 'from') {
        setValue('toAmount', newAmount);
      } else {
        setValue('fromAmount', newAmount);
      }
    }
  };

  return (
    <div className="mb-4 w-full">
      <div className="flex items-center bg-gray-100 rounded-2xl px-6 py-6 mb-2">
        <TokenSelect method={method} tokens={tokens} disabled={disabled} />
        <Controller
          name={`${method}Amount`}
          control={control}
          rules={{
            required: {
              value: required || false,
              message: 'This field is required',
            },
            min: required
              ? {
                  value: 0.00000001,
                  message: 'Value must be greater than 0',
                }
              : undefined,
            // pattern: {
            //   value: /^[0-9]+([.,][0-9]+)?$/,
            //   message: 'Please enter a valid number',
            // },
            validate: (value) => {
              if (!value) return true;
              const numberValue = Number(value.toString().replace(',', '.'));
              return !isNaN(numberValue) || 'Please enter a valid number';
            },
          }}
          render={({ field }) => (
            <input
              type="text"
              inputMode="decimal"
              value={field.value}
              onChange={handleChange}
              className="bg-transparent w-full outline-none text-2xl font-bold w-1/2"
              disabled={disabled}
            />
          )}
        />
      </div>
      {formState.errors[`${method}Amount`]?.message && (
        <span className="text-red-500 text-xs">
          {String(formState.errors[`${method}Amount`]?.message)}
        </span>
      )}
    </div>
  );
});
