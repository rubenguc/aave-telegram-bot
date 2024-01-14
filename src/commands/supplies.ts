import createDebug from "debug";
import { Context } from "telegraf";
import { isAddress } from "viem";
import { getUserResume } from "../methods";

const debug = createDebug("bot:supplies_command");

export const supplies = () => async (ctx: Context) => {
  let address = "";

  debug("Triggered supplies command");

  if ("payload" in ctx) {
    address = (ctx.payload as string).trim();
  }

  debug("Address: %s", address);

  if (address.trim() === "") {
    return await ctx.reply(
      "You must provide an address, type: /supplies <your_address>"
    );
  }

  const isValidAddress = isAddress(address);
  if (!isValidAddress) {
    return await ctx.replyWithMarkdownV2("Invalid address");
  }

  await ctx.replyWithMarkdownV2("Searching supplies", {
    parse_mode: "MarkdownV2",
  });

  const resume = await getUserResume(address);

  debug("Resume: %O", resume);

  const userHasData = resume.length > 0;

  if (!userHasData) {
    return await ctx.replyWithMarkdownV2("No data found", {
      parse_mode: "MarkdownV2",
    });
  }

  let response = "";

  for (const token of resume) {
    response += `*${token.symbol}*\n`;
    response += `Balance: $ ${token.totalBalance}\n`;
    response += `Total supply: $ ${token.totalSupplied}\n`;
    response += `Profit: $ ${token.profit}\n`;
    response += "\n";
  }

  await ctx.reply(response);
};
