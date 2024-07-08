// @ts-nocheck

import { Menu } from "@grammyjs/menu";
import { Keyboard } from "grammy";

const main = new Menu('main-menu')
	.text('🔁 Поделиться номером телефона', async ctx => {
		await ctx.conversation.enter('addPhone')
	}).row()
	// .text('❌ Удалить номер телефона', async ctx => {
	// 	await ctx.conversation.enter('delPhone')
	// }).row()
	.url('💬 Связаться с менеджером', 'https://t.me/WB_OZON_YES').row()
	.url('🤖 Сделать заказ через бота', 'https://t.me/Ozon_WB_Ali_zakaz_bot')

export const mainMenu = new Keyboard()
	.text('Wildeberries')
	.text('OZON').row()
	.text('Yandex')
	.text('Apteka').row()
	.text('📝 Мои данные');

export const wildeberries = new Keyboard()
	.text()



export default main


