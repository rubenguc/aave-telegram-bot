import createDebug from "debug";
import { Context } from "telegraf";

const debug = createDebug("bot:start_command");

export const start = () => async (ctx: Context) => {
  const message = `You can check your address supplies for Aave Polygon V3
  
Just call the command /supplies address`;

  debug(`Triggered "start" command with message \n${message}`);

  await ctx.replyWithMarkdownV2(message, {
    parse_mode: "MarkdownV2",
  });
};
