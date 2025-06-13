// @ts-nocheck

import { Client } from 'amocrm-js'
import { deliveryIds } from './deliveryVars'

const pipelines = {
	'OZON': 7000654,
	'WB': 7022614,
	'YA': 7260770,
	'ZY': 7260794,
}

const pipelinesReverse = {
	7000654: 'OZON',
	7022614: 'Wildberries',
	7260770: 'Yandex',
	7260794: 'Золотое яблоко',
}

const statuses = {
	7000654: {
		// 58771906: 'Неразобранное',
		68250842: '🟣Принят',
		59223350: '🔵В обработке',
		58771914: '🟡Сортируется',
		58929210: '🟠В пути',
		// 65557398: 'Не доехал',
		59013162: '🟢Прибыл в Пункт',
		// 142: 'Выдано',
		// 143: 'Закрыто и не реализовано'
	},
	7022614: {
		// 58920302: 'Неразобранное',
		65557390: '🟣Принят',
		59223322: '🔵В обработке',
		58920306: '🟡Сортируется',
		58920314: '🟠В пути',
		// 65557394: 'Не доехал',
		59013154: '🟢Прибыл в Пункт',
		// 142: 'Выдано',
		// 143: 'Закрыто и не реализовано'
	},
	7260770: {
		// 60533134: 'Неразобранное',
		68250882: '🟣Принят',
		60533138: '🔵В обработке',
		60533142: '🟡Сортируется',
		60533146: '🟠В пути',
		60533302: '🟢Прибыл в Пункт',
		// 142: 'Выдано',
		// 143: 'Закрыто и не реализовано'
	},
	7260794: {
		// 60533306: 'Неразобранное',
		68250890: '🟣Принят',
		60533310: '🔵В обработке',
		60533314: '🟡Сортируется',
		60533318: '🟠В пути',
		64357918: '🟢Прибыл в Пункт',
		// 142: 'Выдано',
		// 143: 'Закрыто и не реализовано'
	}
}

function formatDate(unix) {
	const dateObject = new Date(unix * 1000);
	const date =  dateObject.toLocaleString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
		// hour: '2-digit',
		// minute: '2-digit',
		hour12: false,
	})
	return date
}

function statusesSort(a, b) {
	const statusA = statuses[a.pipeline_id]?.[a.status_id] || 'skip';
	const statusB = statuses[b.pipeline_id]?.[b.status_id] || 'skip';

	const statusOrder = {
    '🟢Прибыл в Пункт': 1,
    '🟠В пути': 2,
    '🟡Сортируется': 3,
    '🔵В обработке': 4,
    '🟣Принят': 5,
  };
	return statusOrder[statusA] - statusOrder[statusB] || statusA.localeCompare(statusB);
}

const client = new Client({
	domain: process.env.AMO_LOGIN!,
	auth: {
		bearer: process.env.AMO_TOKEN!
	},
});


export async function getContact(name, phone, telegram, id)  {
	let contact;
	if (id) contact = await client.contacts.getById(id);
	if (contact?.id) return contact;

	const newContact = new client.Contact;
	newContact.name = name;
	newContact.custom_fields_values = [
		{
			field_id: 1174897, //phone
			values: [{value: phone}]
		},
		{
			field_id: 1765729, //telegram
			values: [{value: telegram}]
		},
	];
	await newContact.save().catch(e => {})
	return newContact;
}

export async function newLead(contact, telegram, shop, city, delivery, qrLink) {
	const lead = new client.Lead('123');
	lead.pipeline_id = pipelines[shop]
	// lead.status_id = pipelines[shop].statusId
	lead.custom_fields_values = [
		{
			field_id: 1770981, // qr
			values: [{value: qrLink}]
		},
		{
			field_id: 1376389,
			values: [{value: deliveryIds[city][delivery]}]
		},
		{
			field_id: 1770983,
			values: [{value: telegram}]
		}
	]


	lead.embeddedContacts.add([contact]);
	await lead.save().catch(e => {
		console.log('ERROR CREATING LEAD')
		console.log('LEAD:', 'address:', lead?.custom_fields_values[1]?.values, 'TGID:', lead?.custom_fields_values[2]?.values)
		console.log('ADDRESS:', deliveryIds[city][delivery])
	})

	return lead
}

const colors = '⚪🔴🟠🟡🟢🔵🟣🟤⚫⭕🔘🧿'
export async function getLeads(ids) {
	if (!ids?.length) {
		return { message: '⚪ Активные заказы отсутствуют', leadsNumber: 0 }
	}
	const response = await client.request.get('/api/v4/leads', {
		filter: {
			// custom_fields_values: { // Might work with amo subscription!!!!!!!!!!!!!
			// 	field_id: 1770983,
			// 	values: [{value: telegram}]
			// }
			id: ids // can add custom field with tgID
		}
	})

	const leads = response.data._embedded?.leads.sort(statusesSort);

	if (!leads?.length) {
		return { message: '⚪ Активные заказы отсутствуют', leadsNumber: 0 }
	}
	
	let message = ``
	leads.forEach(lead => {
		if (!statuses[lead.pipeline_id]?.[lead.status_id]) return;
		const date = formatDate(lead.created_at)
		const mesta = lead.custom_fields_values.find(obj => obj.field_name === 'Количество мест')?.values[0].value;
		const punkt = lead.custom_fields_values.find(obj => obj.field_name === 'Выбрать пункт')?.values[0].value;
		const name = lead.name.replace('Сделка #', 'Заказ ');
		message += `📦${name} от ${date}: ${pipelinesReverse[lead.pipeline_id]}, Статус: ${statuses[lead.pipeline_id]?.[lead.status_id]}\n\n`
		
		// message += `${name}, ${pipelinesReverse[lead.pipeline_id]}, Статус: ${statuses[lead.pipeline_id][lead.status_id]}, Стоимость: ${lead.price || 'не указано'}, Количество мест: ${mesta || 'не указано'}, Пункт получения: ${punkt} \n\n`
	});
	if (!message.length) message = '⚪ Активные заказы отсутствуют';
	if (message.length > 4096) {
		message = message.slice(0, 4092) + '...';
	}
	return { message, leadsNumber: leads.length }
}



