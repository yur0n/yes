

import userModel from '../../models/user.model';
import { InlineKeyboard, Keyboard } from 'grammy'
import { mainMenu } from './menus'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions'

export async function addClientInfo(conversation: any, ctx: any) {
	try {
		await ctx.reply('👨 Пожалуйста, укажите Ваше ФИО (Иванов Иван Иванович)', {
			reply_markup: new Keyboard()
										.text('❌ Отменить')
										.oneTime()
		})
		ctx = await conversation.wait();
		const name = ctx.msg.text;
		if (name === '❌ Отменить') return;

		await ctx.reply('📱 Укажите Ваш номер телефона для связи, пожалуйста', {
			reply_markup: new Keyboard()
										.requestContact('Отправить мой номер').row()
										.text('❌ Отменить')
										.oneTime()
		});
		ctx = await conversation.wait();
		const phone = ctx.msg.text;
		if (phone === '❌ Отменить') return;

		await ctx.reply('📱 Укажите пункт получения посылок, пожалуйста', {
			reply_markup: new InlineKeyboard()
										.text('Пункт 1')
										.text('Пункт 2').row()
										.text('Пункт 3')
										.text('Пункт 4').row()
										.text('❌ Отменить')
		});
		ctx = await conversation.wait();
		const station = ctx.update.callback_query?.data || ctx.msg.text;
		if (!station || station === '❌ Отменить') return;
		await ctx.reply('✅ Ваши данные сохранены!', {
			reply_markup: mainMenu,
		})


	} catch {

	}
}
function genFileName(store: string, length = 8) {
	const filename = Math.random().toString(36).substring(2, length + 2) + '_' + store;
  return filename.replace(/[^a-z0-9]/gi, '_') + '.jpg';
}

export async function qrWB(conversation: any, ctx: any) {
	try {
		ctx.reply('Отправьте скриншот QR-кода в этот чат (отправить быстрым способом');
		ctx = await conversation.wait();
		if (!ctx.msg.photo) return ctx.reply('Неверный формат');
		const photo = (await ctx.api.getFile(ctx.msg.photo[2].file_id));
		const fileName = genFileName('WB')
		await photo.download(`./public/a/${fileName}`)
		const link = `http://176.119.156.143:90/a/${fileName}`
		ctx.reply(link)

	} catch (e) {
		console.log(e)
	}

}






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
			ctx.reply(`✅ Ваш номер телефона ${phone} сохранен, ждите уведомлений о прибытии ваших заказов!`);
		} else {
			ctx.reply('❌ Вы не поделились своим номером телефона');
		// 	replyAndDel(ctx, `✅ Ваш номер телефона ${phone} сохранен, ждите уведомлений о прибытии ваших заказов!`, 10_000);
		// } else {
		// 	replyAndDel(ctx, '❌ Вы не поделились своим номером телефона');
		}
		
	} catch (error) {
		console.log('Bot admin error:', error)
		replyAndDel(ctx, `Системная ошибка, попробуйте позже`)
	}
}