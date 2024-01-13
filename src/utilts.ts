export const formatCrypto = ({
  amount,
  decimals,
}: {
  amount: string;
  decimals: string | number;
}): string => {
  const decimalsPosition = amount.length - Number(decimals);

  const formattedAmount = `${amount.slice(0, decimalsPosition)},${amount.slice(
    decimalsPosition
  )}`;

  const [integer, decimal] = formattedAmount.split(",");
  const trimmedDecimal = decimal.replace(/0+$/, "").slice(0, 2);
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedAmount = trimmedDecimal
    ? `${formattedInteger}.${trimmedDecimal}`
    : formattedInteger;

  return trimmedAmount;
};
