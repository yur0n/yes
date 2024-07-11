
import { Keyboard } from "grammy";

export const mainMenu = new Keyboard().resized()
	.text('Wildberries')
	.text('OZON').row()
	.text('Yandex')
	.text('Золотое яблоко').row()
	.text('📝 Мои данные')
	.text('Мои заказы');