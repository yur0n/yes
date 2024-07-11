import { InlineKeyboard, Keyboard } from 'grammy'
import { mainMenu } from './menus'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions'
import { newLead, getContact } from './amo'


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
«Рижский» ▶️ ул. 50 лет Победы, д. 29\n\n
«Новый Мелитополь» ▶️ ул. Гагарина 3\n\n
«Авоська» ▶️ ул. 30 лет Победы, д. 42А\n\n
«Черный» ▶️ пр Б. Хмельницкого 89\n\n
«Парк» ▶️ ул. Ивана Алексеева 10А
		`,
		keyboard: () => new InlineKeyboard()
									.text('Феникс')
									.text('Рижский').row()
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
										.text('❌ Отменить').resized()
										.oneTime()
		})
		ctx = await conversation.wait();
		if (ctx.msg.text === '❌ Отменить' || !ctx.msg.text) return responseMenu(ctx, 'Главное меню');
		ctx.session.user.name = ctx.msg.text;

		await ctx.reply('📱 Укажите Ваш номер телефона для связив формате +79123456789 или +380123456789', {
			reply_markup: new Keyboard()
										.requestContact('Отправить мой номер').row()
										.text('❌ Отменить').resized()
										.oneTime()
		});
		ctx = await conversation.wait();
		if (ctx.msg.text === '❌ Отменить') return responseMenu(ctx, 'Главное меню');
		if (ctx.update.message?.contact?.phone_number) {
			ctx.session.user.phone = '+' + ctx.update.message?.contact?.phone_number;
		} else if (ctx.msg.text) {
			if (ctx.msg.text.match(/^\+79\d{9}$/) || ctx.msg.text.match(/^\+380\d{9}$/)) {
				ctx.session.user.phone = ctx.msg.text;
			} else {
				ctx.reply('❌ Неверный формат номера. Номер должен быть в формате +79123456789 или +380123456789')
				return ctx.conversation.enter('addClientInfo')
			}
		} else {
			ctx.reply('❌ Номер не сохранен')
			return ctx.conversation.enter('addClientInfo')
		}

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
		const ask = ctx.reply('Отправьте скриншот QR-кода с маркетплейса в этот чат (с компрессией)\n\nПодробнее: https://wb-pvz.ru', {
			reply_markup: new InlineKeyboard()
										.text('❌ Отменить')
		})
		ctx = await conversation.wait();
		if (ctx.update.callback_query?.data == '❌ Отменить') {
			await deleteMsg(ctx, ask.chat.id, ask.message_id)
			return responseMenu(ctx, 'Главное меню');
		} 
		if (!ctx.msg.photo) return responseMenu(ctx, '❌ Неверный формат');
		const photo = await ctx.api.getFile(ctx.msg.photo[ctx.msg.photo.length - 1].file_id);
		const fileName = genFileName(ctx.session.shop)
		await photo.download(`./public/a/${fileName}`)
		const qrLink = `admin.yes-pvz.ru:90/a/${fileName}`

		const { telegram, name, phone, city, delivery, amoId } = ctx.session.user
		if (!name || !phone || !telegram || !city || !delivery) {
			return responseMenu(ctx, '❌ QR-код не добавлен. Полностью заполните информацию о себе!')
		}
		const contact = await getContact(name, phone, telegram, amoId)
		ctx.session.user.amoId = contact?.id
		const lead = await newLead(contact, ctx.session.shop, city, delivery, qrLink)
		const leads = ctx.session.leads ? ctx.session.leads : []
		leads.push(lead.id)
		ctx.session.leads = leads;
		responseMenu(ctx, '✅ QR-код добавлен. Ожидайте вашу посылку!')

	} catch (e) {
		console.log(e)
		responseMenu(ctx, '❌ Ошибка при добавлении QR-кода, попробуйте снова!')
	}
}