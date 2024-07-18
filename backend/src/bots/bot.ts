

import { Bot, session, Context, SessionFlavor } from 'grammy'
import { conversations, createConversation, ConversationFlavor } from '@grammyjs/conversations'
import { delPhone, addPhone } from './bot/conversations'
import main from './bot/menus'
import { deleteMsg, deleteMsgTime, replyAndDel } from './bot/functions'
import messageModel from '../models/message.model';
import userModel from '../models/user.model';

type MyContext = Context & SessionFlavor<{init: number}> & ConversationFlavor;

const bot = new Bot<MyContext>(process.env.SHEET_BOT!)

bot.api.setMyCommands([{ command: 'start', description: 'Меню' } ])

// bot.on('message', (ctx, next) => {
// 	if (ctx.msg.text === '/start') {
// 		deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000);
// 		return next();
// 	}

// 	// deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
// 	// replyAndDel(ctx, 'Я предназначен только для уведомлений о прибытии ваших заказов');
// 	next();
// })



bot.use(session({ initial: () => ({ init: 0 }) }));
bot.use(conversations());
bot.use(createConversation(delPhone));
bot.use(createConversation(addPhone));
bot.use(main)

bot.command('start', async ctx => {
	deleteMsgTime(ctx, ctx.message?.chat.id!, ctx.message?.message_id!, 60_000);
  await ctx.reply('Привет, я бот для отслеживания посылок компании YES !\n\nПоделитесь своим номером телефона и я вам сообщу, когда и куда прибудет ваша посылка!\n\nYES-PVZ.RU', {
		reply_markup: main,
	});
	return;
})

bot.on('message', async ctx => {
	ctx.reply('Данный бот предназначен для получения уведомлений о прибытии ваших заказов.')
	const user = await userModel.findOne({ telegram: ctx.from.id });
	if (!user) return;
	await messageModel.create({
		userId: user._id.toString(),
		message: ctx.msg.text || 'СООБЩЕНИЕ НЕ ОПРЕДЕЛЕНО'
	})
})


bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e: any = err.error;
	if (e.description) {
	  console.error("Error in request:", e.description);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start()

export default bot;