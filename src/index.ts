import { Telegraf } from "telegraf";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { development, production } from "./core";
import { ping, start, supplies } from "./commands";

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const ENVIRONMENT = process.env.NODE_ENV || "";

const bot = new Telegraf(BOT_TOKEN);

bot.command("ping", ping());
bot.command("start", start());
bot.command("supplies", supplies());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== "production" && development(bot);

const checkWebHook = async () => {
  const getWebhookInfo = await bot.telegram.getWebhookInfo();

  console.log(getWebhookInfo);
};

checkWebHook();
