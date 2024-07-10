

import { Bot, Api, session, Context, SessionFlavor, InlineKeyboard } from 'grammy';
import { freeStorage } from "@grammyjs/storage-free";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation, ConversationFlavor } from '@grammyjs/conversations';
import { delPhone, addPhone, addClientInfo, QR } from './amo_bot/conversations';
import { deleteMsg, deleteMsgTime, replyAndDel } from './amo_bot/functions';
import messageModel from '../models/message.model';
import userModel from '../models/user.model';
import { mainMenu, shopMenu } from './amo_bot/menus';

const shops = {
	'Wildberries': 'WB',
	'OZON': 'OZON',
	'Yandex': 'YA',
	'Золотое яблоко': 'ZY'
}
 
interface SessionData {
  user: {
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
bot.use(createConversation(delPhone));
bot.use(createConversation(addPhone));

bot.api.setMyCommands([{ command: 'start', description: 'Меню' } ]);
bot.command('start', async ctx => {
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
		const { name, phone, city, delivery } = ctx.session.user
		ctx.reply(`Telegram: ${ctx.from.id}\nФИО: ${name || 'Не указано'}\nНомер телефона: ${phone || 'Не указан'}\nГород: ${city || 'Не указан'}\nПункт доставки: ${delivery || 'Не указан'}`, {
			reply_markup: new InlineKeyboard()
												.text('Изменить информацию')
		})
	}
	const selectedShop = shops[ctx.msg.text as keyof typeof shops];
	if (selectedShop) {
		ctx.session.shop = selectedShop;
		ctx.reply('Shop information (short example: на сайте ВБ оформите заказ и отправьте скриншот QR-кода, etc etc etc etc', {
			reply_markup: shopMenu()
		})
	}
	if (ctx.msg.text === 'Отправить QR-код') {
		await ctx.conversation.enter('QR')
	}
	if (ctx.msg.text === 'Активные заказы') {
		//call to amo for contacts leads (use ctx.session.shop)
		ctx.reply('to be implemented', {
			reply_markup: mainMenu
		})
	}
	if (ctx.msg.text === 'В главное меню') {
		ctx.reply('Главное меню', {
			reply_markup: mainMenu
		})
	}
	next();
});

bot.on('callback_query', async (ctx, next) => {
	if (ctx.update.callback_query?.data == 'Изменить информацию') {
		await ctx.conversation.enter('addClientInfo')
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