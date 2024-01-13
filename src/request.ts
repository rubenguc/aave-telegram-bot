import { gql } from "graphql-request";
import {
  ReserveConfigurationData,
  ReseverToken,
  Suppli,
  UserReserveData,
  UserToken,
  getSuppliesQueryProps,
} from "./interfaces";
import { getContract } from "viem";
import { gqlClient, netClient } from "./client";
import poolDataProviderABI from "./abis/poolDataProvider.json";

export const getSuppliesQuery = async ({
  userAddress,
  tokenAddresses,
}: getSuppliesQueryProps): Promise<{
  [key: string]: {
    amount: string;
    decimals: number;
  };
}> => {
  try {
    const query = gql`
      query supplies($userAddress: String!, $tokenAddresses: [String!]!) {
        supplies(
          where: {
            user_: { id: $userAddress }
            reserve_: { underlyingAsset_in: $tokenAddresses }
          }
        ) {
          amount
          reserve {
            underlyingAsset
            symbol
            name
            decimals
          }
        }
      }
    `;

    const variables = {
      userAddress: userAddress.toLowerCase(),
      tokenAddresses,
    };

    const { supplies: data } = (await gqlClient.request(query, variables)) as {
      supplies: Suppli[];
    };

    const supplies: {
      [key: string]: {
        amount: string;
        decimals: number;
      };
    } = {};

    data.forEach((supply) => {
      if (!supplies[supply.reserve.underlyingAsset]) {
        supplies[supply.reserve.underlyingAsset] = {
          amount: supply.amount,
          decimals: supply.reserve.decimals,
        };
      } else {
        supplies[supply.reserve.underlyingAsset].amount = (
          BigInt(supplies[supply.reserve.underlyingAsset].amount) +
          BigInt(supply.amount)
        ).toString();
      }
    });

    return supplies;
  } catch (error) {
    return {};
  }
};

export const getUserReserveTokens = async (
  userAddress: string
): Promise<UserToken[]> => {
  try {
    const contract = getContract({
      address: "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
      abi: poolDataProviderABI,
      client: netClient,
    });

    const tokens =
      (await contract.read.getAllReservesTokens()) as ReseverToken[];

    const data = await Promise.all(
      tokens.map(async (token) => {
        const [balance] = (await contract.read.getUserReserveData([
          token.tokenAddress,
          userAddress,
        ])) as UserReserveData[];

        return {
          ...token,
          balance: balance.toString(),
        };
      })
    );

    const tokenWithBalance = data.filter((token) => token.balance !== "0");

    const formattedTokens = await Promise.all(
      tokenWithBalance.map(async (token) => {
        const [decimals] = (await contract.read.getReserveConfigurationData([
          token.tokenAddress,
        ])) as [number];

        return {
          tokenAddress: token.tokenAddress,
          symbol: token.symbol,
          balance: token.balance,
          decimals: decimals,
        };
      })
    );

    return formattedTokens;
  } catch (error) {
    return [];
  }
};
