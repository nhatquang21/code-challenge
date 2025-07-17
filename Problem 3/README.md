## Computational Inefficiencies & Anti-Patterns

### 1. Inefficient Filtering Logic

- **Issue:** In `sortedBalances`, the filter uses `getPriority(balance.blockchain)` but references `lhsPriority` (which is undefined). Also, the filter returns `true` only if `balance.amount <= 0`, which means only zero/negative balances are shown.
- **Improvement:** Use the correct variable name and clarify the filter condition. Typically, you want to show positive balances.

### 2. Redundant useMemo Dependency

- **Issue:** `useMemo` depends on both `balances` and `prices`, but only `balances` is used in the computation.
- **Improvement:** Remove unnecessary dependencies to avoid needless recalculation.

### 3. Incorrect Sorting Logic

- **Issue:** The sort function does not handle equal priorities and may not be stable. Also, the comparison logic is verbose.
- **Improvement:** Use a simpler comparator: `return rightPriority - leftPriority;`

### 4. Formatting Outside Memoization

- **Issue:** `formattedBalances` is calculated outside `useMemo`, causing unnecessary recalculation on every render.
- **Improvement:** Move formatting inside `useMemo` so it only recalculates when dependencies change.

### 5. Type Mismatch in Mapping

- **Issue:** `rows` maps over `sortedBalances` (type `WalletBalance`), but expects `FormattedWalletBalance` (with `formatted` property).
- **Improvement:** Map over `formattedBalances` instead.

### 6. Using Array Index as Key

- **Issue:** Using `index` as a key in React can cause rendering issues if the list order changes.
- **Improvement:** Use a unique property (e.g., currency) as the key.

### 7. Unused Children Prop

- **Issue:** `children` is destructured from props but never used.
- **Improvement:** Remove unused destructuring.

### 8. Unnecessary Spread of Props

- **Issue:** Spreading `...rest` into a `div` may add unwanted props.
- **Improvement:** Only pass necessary props.

### 9. Inefficient Declaration of `rows` Inside Component

- **Issue:** Declaring `rows` directly inside the component body causes it to be recalculated on every render, even if the input data (`formattedBalances`, `prices`, etc.) has not changed. This can lead to unnecessary computations and reduced performance, especially with large lists.
- **Improvement:** Use `useMemo` or extract the rendering logic into a memoized child component (e.g., with `React.memo`) so that `rows` are only recalculated when their dependencies change. This optimizes rendering and improves efficiency.

### 10. Handling Undefined Price Values

- **Issue:** If `prices[balance.currency]` is `undefined`, the calculation for `usdValue` will result in `NaN`, which can cause display errors or unexpected behavior in the UI.
- **Improvement:** Use a default value (e.g., 0) when the price is undefined

---

## Refactored Code

```
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

interface WalletRowsProps {
  formattedBalances: FormattedWalletBalance[];
  prices: Record<string, number>;
}

const WalletRows: React.FC<WalletRowsProps> = React.memo(({ formattedBalances, prices }) => {
  return formattedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] ??  0) * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });
});
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis': return 100;
    case 'Ethereum': return 50;
    case 'Arbitrum': return 30;
    case 'Zilliqa':
    case 'Neo': return 20;
    default: return -99;
  }
};

const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
  }, [balances]);


  return <div>
  <WalletRows
    formattedBalances={formattedBalances}
    prices={prices}
  />
</div>;};
```
