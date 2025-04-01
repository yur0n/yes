import { InlineKeyboard, Keyboard } from 'grammy'
import { mainMenu } from './menus'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions'
import { newLead, getContact } from './amo'
import { deliveryPoints, cities } from './deliveryVars'


async function responseMenu(ctx: any, text: string) {
	try {
		await ctx.reply(text, {
			reply_markup: mainMenu
		})
	} catch (e) {}
}

function genFileName(store: string, length = 8) {
	const filename = Math.random().toString(36).substring(2, length + 2) + '_' + store;
  return filename.replace(/[^a-z0-9]/gi, '_') + '.jpg';
}

export async function addClientInfo(conversation: any, ctx: any) {
	try {
		await ctx.reply('👨 Пожалуйста, укажите Ваше ФИО (Иванов Иван Иванович)', {
			reply_markup: new Keyboard()
										.text('❌ Отменить').resized()
										.oneTime()
		})
		ctx = await conversation.wait();
		if (ctx.msg?.text === '❌ Отменить' || !ctx.msg?.text) return responseMenu(ctx, '☰ Главное меню');
		ctx.session.user.name = ctx.msg.text.substring(0, 50);

		await ctx.reply('📱 Укажите Ваш номер телефона для связи в формате +79123456789 или +380123456789', {
			reply_markup: new Keyboard()
										.requestContact('Отправить мой номер').row()
										.text('❌ Отменить').resized()
										.oneTime()
		});
		ctx = await conversation.wait();
		if (ctx.msg?.text === '❌ Отменить') return responseMenu(ctx, '☰ Главное меню');
		if (ctx.update.message?.contact?.phone_number) {
			ctx.session.user.phone = '+' + ctx.update.message?.contact?.phone_number.substring(0, 50);
		} else if (ctx.msg?.text) {
			if (ctx.msg.text.match(/^\+79\d{9}$/) || ctx.msg.text.match(/^\+380\d{9}$/)) {
				ctx.session.user.phone = ctx.msg.text.substring(0, 50);
			} else {
				ctx.reply('❌ Неверный формат номера. Номер должен быть в формате +79123456789 или +380123456789')
				return ctx.conversation.enter('addClientInfo')
			}
		} else {
			ctx.reply('❌ Номер не сохранен')
			return ctx.conversation.enter('addClientInfo')
		}

		await ctx.reply('🏙️ Выберите Ваш город', {
			reply_markup: cities
		});
		ctx = await conversation.wait();
		await ctx.answerCallbackQuery();
		const city = ctx.update.callback_query?.data;
		if (!city || city === '❌ Отменить') return responseMenu(ctx, '☰ Главное меню');
		ctx.session.user.city = city.substring(0, 50);

		
		const selectedCity = deliveryPoints[city as keyof typeof deliveryPoints];
		await ctx.reply(`📍 Выберите пункт получения посылок:\n\n` + selectedCity.text, {
			reply_markup: selectedCity.keyboard
		});
		ctx = await conversation.wait();
		await ctx.answerCallbackQuery();
		const delivery = ctx.update.callback_query?.data;
		if (!delivery || delivery === '❌ Отменить') return responseMenu(ctx, '☰ Главное меню');
		ctx.session.user.delivery = delivery.substring(0, 50);
		responseMenu(ctx, '✅ Ваши данные сохранены!')
	} catch (e: any) {
		console.log(e.message)
	}
}

export async function QR(conversation: any, ctx: any) {
	try {
		ctx.reply('🏿 Прикрепите скриншот QR-кода с помщью <u>скрепки</u> и нажмите отправить!', {
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard()
										.text('❌ Отменить')
		})
		ctx = await conversation.wait();
		const callback = ctx.update.callback_query
		if (callback?.data == '❌ Отменить') {
			await ctx.answerCallbackQuery();
			await deleteMsg(ctx, callback?.from.id, callback?.message.message_id)
			return responseMenu(ctx, '☰ Главное меню');
		} 
		if (!ctx.msg?.photo) return responseMenu(ctx, '❌ Неверный формат');
		const photo = await ctx.api.getFile(ctx.msg?.photo[ctx.msg?.photo.length - 1]?.file_id);
		const fileName = genFileName(ctx.session.shop)
		await photo.download(`./public/a/${fileName}`)
		const qrLink = `admin.yes-pvz.ru:90/a/${fileName}`

		const { telegram, name, phone, city, delivery, amoId } = ctx.session.user
		if (!name || !phone || !telegram || !city || !delivery) {
			return responseMenu(ctx, '❌ QR-код не добавлен. Полностью заполните информацию о себе!')
		}
		const contact = await getContact(name, phone, telegram, amoId)

		ctx.session.user.amoId = contact?.id
		const lead = await newLead(contact, telegram, ctx.session.shop, city, delivery, qrLink)
		const leads = ctx.session.leads ? ctx.session.leads : []
		leads.push(lead.id)
		ctx.session.leads = leads;
		responseMenu(ctx, '✅ QR-код добавлен. Ожидайте вашу посылку!')

	} catch (e: any) {
		console.log(e.message)
		responseMenu(ctx, '❌ Ошибка при добавлении QR-кода, попробуйте снова!')
	}
}