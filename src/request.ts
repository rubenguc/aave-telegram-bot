import { gql } from "graphql-request";
import {
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
    const suppliesQuery = gql`
      query supplies($userAddress: String!, $tokenAddresses: [String!]!) {
        supplies(
          where: {
            user_: { id: $userAddress }
            reserve_: { underlyingAsset_in: $tokenAddresses }
          }
        ) {
          amount
          action
          reserve {
            underlyingAsset
            symbol
            name
            decimals
          }
        }
      }
    `;

    const withdrawsQuery = gql`
      query redeemUnderlyings(
        $userAddress: String!
        $tokenAddresses: [String!]!
      ) {
        redeemUnderlyings(
          where: {
            user_: { id: $userAddress }
            reserve_: { underlyingAsset_in: $tokenAddresses }
          }
        ) {
          amount
          action
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

    const { supplies: data } = (await gqlClient.request(
      suppliesQuery,
      variables
    )) as {
      supplies: Suppli[];
    };

    const { redeemUnderlyings: withdraws } = (await gqlClient.request(
      withdrawsQuery,
      variables
    )) as {
      redeemUnderlyings: Suppli[];
    };

    const allData = [...data, ...withdraws];

    const supplies: {
      [key: string]: {
        amount: string;
        decimals: number;
      };
    } = {};

    let totalSupplied = 0;
    let totalWithdrawn = 0;

    allData.forEach((supply) => {
      const asset = supply.reserve.underlyingAsset;

      const isWithdraw = supply.action === "RedeemUnderlying";

      const amount = isWithdraw ? `-${supply.amount}` : supply.amount;

      if (isWithdraw) {
        totalWithdrawn += Number(supply.amount);
      } else {
        totalSupplied += Number(supply.amount);
      }

      console.log("supply:", supply);

      if (!supplies[asset]) {
        supplies[asset] = {
          amount: amount,
          decimals: supply.reserve.decimals,
        };
      } else {
        supplies[asset].amount = (
          BigInt(supplies[asset].amount) + BigInt(amount)
        ).toString();
      }
    });

    console.log("totals:", {
      totalSupplied,
      totalWithdrawn,
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
