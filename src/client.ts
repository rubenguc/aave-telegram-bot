import { GraphQLClient } from "graphql-request";
import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";
import { GRAPHS } from "./graphs";

export const netClient = createPublicClient({
  chain: polygon,
  transport: http(),
});

export const gqlClient = new GraphQLClient(GRAPHS.polygon);
