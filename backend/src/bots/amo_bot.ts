

import { Bot, Api, session, Context, SessionFlavor, InlineKeyboard } from 'grammy';
import { freeStorage } from "@grammyjs/storage-free";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation, ConversationFlavor } from '@grammyjs/conversations';
import { addClientInfo, QR } from './amo_bot/conversations';
import { deleteMsg, deleteMsgTime, replyAndDel } from './amo_bot/functions';
import { getContact } from './amo_bot/amo'
import { mainMenu } from './amo_bot/menus';

const shops = {
	'Wildberries': 'WB',
	'OZON': 'OZON',
	'Yandex': 'YA',
	'Золотое яблоко': 'ZY'
}
 
interface SessionData {
  user: {
		telegram?: string;
		name?: string;
		phone?: string;
		city?: string;
		delivery?: string;
		amoId?: number;
	}
	shop?: string;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor & FileFlavor<Context> & FileApiFlavor<Api>;

const bot = new Bot<MyContext>(process.env.AMO_BOT!);

// bot.on('message', (ctx, next) => {
// 	if (ctx.msg.text === '/start') {
// 		deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000);
// 		return next();
// 	}

// 	// deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
// 	// replyAndDel(ctx, 'Я предназначен только для уведомлений о прибытии ваших заказов');
// 	next();
// })


bot.api.config.use(hydrateFiles(bot.token));
bot.use(session({ 
	initial: () => ({ user: {} }), 
	storage: freeStorage<SessionData>(bot.token) }));
bot.use(conversations());
bot.use(createConversation(addClientInfo));
bot.use(createConversation(QR));

bot.api.setMyCommands([{ command: 'start', description: 'Меню' } ]);
bot.command('start', async ctx => {
	ctx.session.user.telegram = ctx.from?.id.toString();
	if (ctx.session.user.phone) {
		ctx.reply('Главное меню', {
			reply_markup: mainMenu
		})
	} else {
		await ctx.conversation.enter('addClientInfo')
	}
	return;
});

bot.on('message', async (ctx, next) => {
	if (ctx.msg.text === '📝 Мои данные') {
		const { telegram, name, phone, city, delivery } = ctx.session.user
		ctx.reply(`Telegram: ${telegram}\nФИО: ${name || 'Не указано'}\nНомер телефона: ${phone || 'Не указан'}\nГород: ${city || 'Не указан'}\nПункт доставки: ${delivery || 'Не указан'}`, {
			reply_markup: new InlineKeyboard()
												.text('Изменить')
												.text('Скрыть')
		})
	} 
	const selectedShop = shops[ctx.msg.text as keyof typeof shops];
	if (selectedShop) {
		ctx.session.shop = selectedShop;
		await ctx.conversation.enter('QR')
	}
	if (ctx.msg.text === 'Мои заказы') {
		if (!ctx.session.user.amoId) {
			return ctx.reply('Вы еще не сделали ниодного заказа')
		}
		console.log(await getContact(ctx.session.user.amoId))
		ctx.reply('to be implemented')
	}
	next();
});

bot.on('callback_query', async (ctx, next) => {
	const callback = ctx.update.callback_query
	if (callback?.data == 'Изменить') {
		await ctx.conversation.enter('addClientInfo')
	}
	if (callback?.data == 'Скрыть') {
		deleteMsg(ctx, callback?.from.id, callback?.message?.message_id || 1)
	} 
	next();
});


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

bot.start();

export default bot;