// @ts-nocheck

import { Menu } from "@grammyjs/menu"

const main = new Menu('main-menu')
	.text('🔁 Поделиться номером телефона', async ctx => {
		await ctx.conversation.enter('addPhone')
	}).row()
	// .text('❌ Удалить номер телефона', async ctx => {
	// 	await ctx.conversation.enter('delPhone')
	// }).row()
	.url('💬 Связаться с менеджером', 'https://t.me/WB_OZON_YES').row()
	.url('🤖 Сделать заказ через бота', 'https://t.me/Ozon_WB_Ali_zakaz_bot')

export default main
