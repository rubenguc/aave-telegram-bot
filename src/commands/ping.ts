import createDebug from "debug";
import { Context } from "telegraf";

const debug = createDebug("bot:about_command");

export const ping = () => async (ctx: Context) => {
  const message = `🏓 Pong ${ctx.message?.from?.first_name}`;

  debug(`Triggered "about" command with message \n${message}`);

  await ctx.replyWithMarkdownV2(message, {
    parse_mode: "MarkdownV2",
  });
};
