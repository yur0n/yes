import { Request, Response } from 'express';
import bot from '../bots/amo_bot';

const pipelines = {
	'7000654': 'OZON',
	'7022614': 'Wildberries',
	'7260770': 'Yandex',
	'7260794': 'Золотое яблоко',
}

const arrivedStatuses = ['59013162', '59013154', '60533302', '64357918']

export async function amoLeadChange (req: Request, res: Response) {
	try {
		const { leads } = req.body;
		const leadStatus = leads.update[0].status_id
		const tgID = leads.update[0].custom_fields.find((field: {name: string})  => field.name === 'tgID')?.values[0].value
		if (!arrivedStatuses.includes(leadStatus) || !tgID) {
			return res.send('ok')
		}
		const name = `Заказ ${leads.update[0].id}`
		const pipeline = pipelines[leads.update[0].pipeline_id as keyof typeof pipelines]
		const mesta = leads.update[0].custom_fields.find((field: {name: string}) => field.name === 'Количество мест')?.values[0].value;
		const punkt = leads.update[0].custom_fields.find((field: {name: string}) => field.name === 'Выбрать пункт')?.values[0].value;
		const price = leads.update[0].price;

		console.log(name,tgID, pipeline, mesta, punkt, price)
		const message = `${name} из ${pipeline} 🟢Прибыл в пункт: ${punkt}. Стоимость: ${price || 'не указано'}, Количество мест: ${mesta || 'не указано'}`
		await bot.api.sendMessage(tgID, message)
		res.send('ok')
	} catch (e) {
		console.log(e);
		res.send('ok')
	}
	
	// const users: IUser[] = req.body
	// if (!users?.length ) {
	// 	res.status(400).send('Invalid data');
	// 	return;
	// }
	// const status = await sendNotification(users);
	// res.send(status);
}

// async function sendNotification(users: IUser[]) {
// 	const status: { row: number, status: boolean}[] = [];
// 	try {
// 		for (const user of users) {
// 			let reciver;
// 			try {
// 				reciver = await userModel.findOne({ phone: user.phone });
// 			} catch (e) {
// 				user.goods.forEach(good => status.push({ row: good.row, status: false }));
// 				continue;
// 			}
// 			if (!reciver) {
// 				user.goods.forEach(good => status.push({ row: good.row, status: false }));
// 				continue;
// 			}
// 			let message = `Уважаемый клиент, прибыл заказ ${user.code}:\n`
// 			user.goods.forEach(good => {
// 				message += `\n${good.description} - ${good.arrivedAmount} шт`;
// 				if (good.arrivedAmount < good.totalAmount) {
// 					message += ` из ${good.totalAmount}`;
// 				}
// 			});
// 			message += `\n\nПункт выдачи: ${user.place}\n\nВаш YES-PVZ.RU`;
// 			try {
// 				await bot.api.sendMessage(reciver.telegram, message);
// 				await messageModel.create({
// 					userId: reciver._id.toString(),
// 					message: `ОПОВЕЩЕН О ПРИБЫТИИ ЗАКАЗА ${user.code}`,
// 					user: false
// 				});
// 				user.goods.forEach(good => status.push({ row: good.row, status: true }));
// 			} catch (e) {
// 				user.goods.forEach(good => status.push({ row: good.row, status: false }));
// 			}
// 			await new Promise(resolve => setTimeout(resolve, 100));
// 		}
// 		return status;
// 	}
// 	catch (e) {
// 		console.log(e);
// 		return status;
// 	}
// }

// interface IUser {
// 	totalPrice: number, 
// 	deliveryPrice: number, 
// 	code: string, 
// 	phone: string, 
// 	place: string, 
// 	goods: IGood[],
// 	name: string
// }

// interface IGood {
// 	link: string, 
// 	row: number,
// 	price: number, 
// 	arrivedAmount: number, 
// 	description: string, 
// 	totalAmount: number
// }
