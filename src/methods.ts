import { UserResume } from "./interfaces";
import { getSuppliesQuery, getUserReserveTokens } from "./request";
import { formatCrypto } from "./utilts";

export const getUserResume = async (
  userAddress: string
): Promise<UserResume[]> => {
  const userTokens = await getUserReserveTokens(userAddress);
  const tokenAddresses = userTokens.map((token) => token.tokenAddress);

  const supplies = await getSuppliesQuery({
    userAddress,
    tokenAddresses,
  });

  const resume = userTokens.map((token) => {
    const supply = supplies[token.tokenAddress.toLowerCase()];
    const reward = BigInt(token.balance) - BigInt(supply.amount);
    return {
      symbol: token.symbol,
      totalBalance: formatCrypto({
        amount: token.balance,
        decimals: token.decimals,
      }),
      totalSupplied: formatCrypto({
        amount: supply.amount,
        decimals: supply.decimals,
      }),
      profit: formatCrypto({
        amount: reward.toString(),
        decimals: token.decimals,
      }),
    };
  });

  return resume;
};
