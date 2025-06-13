

import { Bot, Api, session, Context, SessionFlavor, InlineKeyboard, GrammyError } from 'grammy';
import { run } from "@grammyjs/runner";
import { freeStorage } from "@grammyjs/storage-free";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation, ConversationFlavor } from '@grammyjs/conversations';
import { addClientInfo, QR } from './amo_bot/conversations';
import { deleteMsg, deleteMsgTime, replyAndDel } from './amo_bot/functions';
import { getLeads } from './amo_bot/amo'
import { mainMenu } from './amo_bot/menus';
import { updatePoints } from './amo_bot/deliveryVars';

function removeInvalidUtf8(str: string) {
	return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
}

const shops = {
	'🟪 Wildberries': 'WB',
	'🟦 OZON': 'OZON',
	'🟧 Yandex': 'YA',
	'🟨 Золотое яблоко': 'ZY'
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
	leads?: [];
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor & FileFlavor<Context> & FileApiFlavor<Api>;

const bot = new Bot<MyContext>(process.env.AMO_BOT!);

bot.api.config.use(hydrateFiles(bot.token));
bot.use(session({ 
	initial: () => ({ user: {}, shop: '', leads: [] }), 
	storage: freeStorage<SessionData>(bot.token) }));
bot.use(conversations());
bot.use(createConversation(addClientInfo));
bot.use(createConversation(QR));

bot.api.setMyCommands([{ command: 'start', description: 'Меню' } ]);

// bot.use(async (ctx, next) => {
//     console.log('📨 Received update:', {
//         updateId: ctx.update.update_id,
//         type: Object.keys(ctx.update)[1],
//         from: ctx.from?.id,
//         text: ctx.message?.text || 'no text'
//     });
//     await next();
// });

bot.command('start', async ctx => {
	ctx.session.user.telegram = ctx.from?.id.toString();
	if (ctx.session.user.phone) {
		await ctx.reply('☰ Главное меню', {
			reply_markup: mainMenu
		})
	} else {
		await ctx.conversation.enter('addClientInfo')
	}
	return;
});

bot.command('updateAmo',  async ctx => {
	await ctx.reply('Обновляю!');
	const updated = await updatePoints();
	const response = updated ? 'Обновлено!' : 'Ошибка обновления';
	return await ctx.reply(response, {
		reply_markup: mainMenu
	})
})

bot.on('message', async (ctx, next) => {
	if (ctx.msg.text === '📝 Мои данные') {
		const { telegram, name, phone, city, delivery } = ctx.session.user
		await ctx.reply(removeInvalidUtf8(`🌐Telegram: ${telegram}\n👨ФИО: ${name || 'Не указано'}\n📱Номер телефона: ${phone || 'Не указан'}\n🏙️Город: ${city || 'Не указан'}\n📍Пункт доставки: ${delivery || 'Не указан'}`), {
			reply_markup: new InlineKeyboard()
												.text('✏️ Изменить')
												.text('👁 Скрыть')
		})
	} 
	const selectedShop = shops[ctx.msg.text as keyof typeof shops];
	if (selectedShop) {
		const { leadsNumber } = await getLeads(ctx.session.leads)
		if (leadsNumber >= 30) {
			return await ctx.reply('❌ Вы сделали слишком много заказов, пожалуйста, подождите обработку предыдущих заказов или обратитесь в поддержку');
		}
		ctx.session.shop = selectedShop;
		await ctx.conversation.enter('QR')
	}
	if (ctx.msg.text === '📦 Мои заказы') {
		if (!ctx.session.leads?.length) {
			return await ctx.reply('⚪ Вы еще не сделали ни одного заказа')
		}
		const { message } = await getLeads(ctx.session.leads)
		await ctx.reply(message)
	}
	await next();
});

bot.on('callback_query', async (ctx, next) => {
	await ctx.answerCallbackQuery();
	const callback = ctx.update.callback_query;
	if (callback?.data == '✏️ Изменить') {
		await ctx.conversation.enter('addClientInfo')
	}
	if (callback?.data == '👁 Скрыть') {
		deleteMsg(ctx, callback?.from.id, callback?.message?.message_id || 1)
	} 
	await next();
});


bot.catch((err) => {
	const ctx = err.ctx;
	const e: any = err.error;

	console.error('❌ Error while handling update:', {
        updateId: ctx.update?.update_id,
        type: Object.keys(ctx.update)[1],
        from: ctx.from?.id,
        text: ctx.message?.text || ctx.update.callback_query?.data || 'empty',
    });

	if (e.error_code === 403 && e.description?.includes('bot was blocked by the user')) {
        console.log(`User ${ctx.from?.id} blocked the bot`);
    } else if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);								
	} else if (e.description) {
	  	console.error("Error in request:", e.description);
	} else {
	  	console.error("Unknown error:", e.message);
		ctx.reply('❌ Ошибка обработки запроса, пожалуйста, попробуйте позже или обратитесь в поддержку');
	}

	return
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

async function startBot() {
	await bot.api.getUpdates({ offset: -1, limit: 1 });
	run(bot);
}

startBot();

export default bot;