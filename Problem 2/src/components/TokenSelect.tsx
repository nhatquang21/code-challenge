import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Controller, useFormContext } from 'react-hook-form';
import { memo } from 'react';

interface TokenSelectProps {
  method: 'from' | 'to';
  tokens: { currency: string; logo: string; price: number }[];
  disabled?: boolean;
}

const formatResult = (num: number): string => {
  const str = num.toFixed(4);
  return str.replace(/\.?0+$/, '');
};

export const TokenSelect = memo(function TokenSelect({
  method,
  tokens,
  disabled,
}: TokenSelectProps) {
  const { getValues, setValue, control } = useFormContext();

  const handleOnChangeSelect = (value: string) => {
    const selectedToken = tokens.find((token) => token.currency === value);
    if (selectedToken) {
      setValue(`${method}Token`, selectedToken.currency);

      const fromToken = method === 'from' ? value : getValues('fromToken');
      const toToken = method === 'to' ? value : getValues('toToken');

      if (fromToken && toToken) {
        const fromTokenPrice = tokens.find(
          (t) => t.currency === fromToken
        )?.price;

        const toTokenPrice = tokens.find((t) => t.currency === toToken)?.price;

        const fromAmount = getValues('fromAmount');

        if (fromAmount && fromTokenPrice && toTokenPrice) {
          const newToAmount = formatResult(
            (Number(fromAmount) * fromTokenPrice) / toTokenPrice
          );
          setValue('toAmount', newToAmount);
        }
      }
    }
  };

  return (
    <div className="w-50">
      <Controller
        control={control}
        name={`${method}Token`}
        render={({ field: { value } }) => (
          <Select
            value={value}
            onValueChange={handleOnChangeSelect}
            disabled={disabled}
          >
            <SelectTrigger className="border-0 shadow-none focus-visible:border-0 focus-visible:ring-0">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem value={token.currency} key={token.currency}>
                  <span className="flex items-center gap-2">
                    <img
                      src={token.logo}
                      alt={token.currency}
                      className="w-5 h-5"
                    />
                    {token.currency}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
});
