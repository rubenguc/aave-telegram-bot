export interface ReseverToken {
  tokenAddress: string;
  symbol: string;
}

export type UserReserveData = [number];

export type ReserveConfigurationData = [number];

export interface getSuppliesQueryProps {
  userAddress: string;
  tokenAddresses: string[];
}

interface Reserve {
  underlyingAsset: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface Suppli {
  amount: string;
  reserve: Reserve;
}

export interface UserToken {
  tokenAddress: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface UserResume {
  symbol: string;
  totalBalance: string;
  totalSupplied: string;
  profit: string;
}
