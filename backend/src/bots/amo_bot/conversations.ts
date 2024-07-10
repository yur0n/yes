

import userModel from '../../models/user.model';
import { InlineKeyboard, Keyboard } from 'grammy'
import { mainMenu } from './menus'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions'


function responseMenu(ctx: any, text: string) {
	ctx.reply(text, {
		reply_markup: mainMenu
	})
}

function genFileName(store: string, length = 8) {
	const filename = Math.random().toString(36).substring(2, length + 2) + '_' + store;
  return filename.replace(/[^a-z0-9]/gi, '_') + '.jpg';
}

const deliveryPoints = {
	'Мелитополь': {
		text: `
«Феникс» ▶️ ул. Кирова, 50/1, ТЦ Феникс\n\n
«Рижский YES» ▶️ ул. 50 лет Победы, д. 29\n\n
«Новый Мелитополь» ▶️ ул. Гагарина 3\n\n
«Авоська» ▶️ ул. 30 лет Победы, д. 42А\n\n
«Черный» ▶️ пр Б. Хмельницкого 89\n\n
«Парк» ▶️ ул. Ивана Алексеева 10А
		`,
		keyboard: () => new InlineKeyboard()
									.text('Феникс')
									.text('Рижский YES').row()
									.text('Новый Мелитополь')
									.text('Авоська').row()
									.text('Черный')
									.text('Парк')
	},
	'Бердянск': {
		text: `
«Авокадо» ▶️ пр. Победы 11Б\n\n
«Кировский» ▶️ ул. Волонтеров 49Б\n\n
«ЖД» ▶️ пр. Восточный 119\n\n
«Гайдара» ▶️ бульвар Шевченко 12А\n\n
«Fox» ▶️ ул. Университетская 16\n\n
		`,
		keyboard: () => new InlineKeyboard()
									.text('Авокадо')
									.text('Кировский').row()
									.text('ЖД')
									.text('Гайдара').row()
									.text('Fox')
	},
	'Приморск': {
		text: `
«Центр» ▶️ ул. Дружбы 15Б
		`,
		keyboard: () => new InlineKeyboard()
									.text('Центр')
	}
}

export async function addClientInfo(conversation: any, ctx: any) {
	try {
		await ctx.reply('👨 Пожалуйста, укажите Ваше ФИО (Иванов Иван Иванович)', {
			reply_markup: new Keyboard()
										.text('❌ Отменить')
										.oneTime()
		})
		ctx = await conversation.wait();
		if (ctx.msg.text === '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		ctx.session.user.name = ctx.msg.text;

		await ctx.reply('📱 Укажите Ваш номер телефона для связи', {
			reply_markup: new Keyboard()
										.requestContact('Отправить мой номер').row()
										.text('❌ Отменить')
										.oneTime()
		});
		ctx = await conversation.wait();
		if (ctx.msg.text === '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		ctx.session.user.phone = ctx.update.message?.contact?.phone_number || ctx.msg.text;

		await ctx.reply('Выберите Ваш город', {
			reply_markup: new InlineKeyboard()
										.text('Мелитополь')
										.text('Бердянск')
										.text('Приморск').row()
										.text('❌ Отменить')
		});
		ctx = await conversation.wait();
		const city = ctx.update.callback_query?.data;
		if (!city || city === '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		ctx.session.user.city = city;

		const selectedCity = deliveryPoints[city as keyof typeof deliveryPoints];
		await ctx.reply(`Выберите пункт получения посылок:\n\n` + selectedCity.text, {
			reply_markup: selectedCity.keyboard()
		});
		ctx = await conversation.wait();
		const delivery = ctx.update.callback_query?.data;
		if (!delivery || delivery === '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		ctx.session.user.delivery = delivery;
		responseMenu(ctx, '✅ Ваши данные сохранены!')
	} catch (e) {
		console.log(e)
	}
}

export async function QR(conversation: any, ctx: any) {
	try {
		ctx.reply('Отправьте скриншот QR-кода в этот чат (отправить быстрым способом)', {
			reply_markup: new InlineKeyboard()
										.text('❌ Отменить')
		});
		ctx = await conversation.wait();
		if (ctx.update.callback_query?.data == '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		if (!ctx.msg.photo) return responseMenu(ctx, 'Неверный формат');
		const photo = await ctx.api.getFile(ctx.msg.photo[2].file_id);
		const fileName = genFileName(ctx.session.shop)
		await photo.download(`./public/a/${fileName}`)
		const qrLink = `admin.yes-pvz.ru:90/a/${fileName}`
		responseMenu(ctx, '✅ QR-код добавлен!')

		// form lead with contact info

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