

import userModel from '../../models/user.model';
import { InlineKeyboard, Keyboard } from 'grammy'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions'

export async function delPhone(conversation: any, ctx: any) {
	try {
		let ask = await ctx.reply('Вы уверены?', {
			reply_markup: new InlineKeyboard().text('✅ Да').text('🚫 Отменить')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data == '🚫 Отменить') return
		if (ctx.update.callback_query?.data == '✅ Да') {
			let user = await userModel.findOne({ telegram: ctx.from.id });
			if (user) {
				await user.updateOne({ phone: '' });
				replyAndDel(ctx, '✅ Номер удален');
			} else {
				replyAndDel(ctx, 'ℹ️ Вы не зарегистрированы');
			}
		} else {
			deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
		}
	} catch (error) {
		console.log('Bot error:', error)
		replyAndDel(ctx, `Системная ошибка, попробуйте позже`)
	}
}

export async function addPhone(conversation: any, ctx: any) {
	try {
		let ask = await ctx.reply('Нажмите на кнопку Поделиться', {
			reply_markup: new Keyboard().requestContact('Поделиться').oneTime().resized()
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data) return
		deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
		if (ctx.update.message?.contact?.phone_number) {
			const phone = ctx.update.message.contact.phone_number;
			const user = {
				phone,
				name: ctx.from.first_name? ctx.from.last_name ? `${ctx.from.first_name} ${ctx.from.last_name}` : ctx.from.first_name : '',
				username: ctx.from.username
			}
			await userModel.findOneAndUpdate({ telegram: ctx.from.id }, user, { upsert: true, new: true });
			replyAndDel(ctx, `✅ Ваш номер телефона ${phone} сохранен, ждите уведомлений о прибытии ваших заказов!`, 10_000);
		} else {
			replyAndDel(ctx, '❌ Вы не поделились своим номером телефона');
		}
		
	} catch (error) {
		console.log('Bot admin error:', error)
		replyAndDel(ctx, `Системная ошибка, попробуйте позже`)
	}
}