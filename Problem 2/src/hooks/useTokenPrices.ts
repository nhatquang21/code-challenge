import { useSuspenseQuery } from '@tanstack/react-query';

const PRICE_URL = 'https://interview.switcheo.com/prices.json';

export interface TokenPriceEntry {
  currency: string;
  date: string;
  price: number;
  logo: string;
}
export type TokenPrice = TokenPriceEntry[];

const TOKEN_ICON_URL = (symbol: string) =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

export function useTokenPrices() {
  return useSuspenseQuery<TokenPrice, Error, TokenPrice>({
    queryKey: ['token-prices'],
    queryFn: ({ signal }) =>
      fetch(PRICE_URL, {
        signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error('Failed to fetch token prices');
          return r.json();
        })
        .catch((e: unknown) => {
          throw e;
        }),
    select: (data) => {
      const latestPrices = data.reduce((acc, entry) => {
        const existing = acc.get(entry.currency);
        if (!existing || new Date(entry.date) > new Date(existing.date)) {
          acc.set(entry.currency, entry);
        }
        return acc;
      }, new Map<string, TokenPriceEntry>());

      return Array.from(latestPrices.values()).map((entry) => ({
        ...entry,
        logo: TOKEN_ICON_URL(entry.currency),
      }));
    },
  });
}
