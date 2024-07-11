// @ts-nocheck

import { Client } from 'amocrm-js'
import { pipeline } from 'stream';

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
		58771906: 'Неразобранное',
		59223350: 'Обработка',
		58771914: 'Сортировка',
		58929210: 'В пути',
		65557398: 'Не доехал',
		59013162: 'На пункте',
		142: 'Выдано',
		143: 'Закрыто и не реализовано'
	},
	7022614: {
		58920302: 'Неразобранное',
		65557390: 'Выдача',
		59223322: 'Обработка',
		58920306: 'Сортировка',
		58920314: 'В пути',
		65557394: 'Не доехал',
		59013154: 'На пункте',
		142: 'Выдано',
		143: 'Закрыто и не реализовано'
	},
	7260770: {
		60533134: 'Неразобранное',
		60533138: 'Обработка',
		60533142: 'Сортировка',
		60533146: 'В пути',
		60533302: 'На пункте',
		142: 'Выдано',
		143: 'Закрыто и не реализовано'
	},
	7260794: {
		60533306: 'Неразобранное',
		60533310: 'Обработка',
		60533314: 'Отсортирован',
		60533318: 'В пути',
		64357918: 'На пункте',
		142: 'Выдано',
		143: 'Закрыто и не реализовано'
	}
}

const deliveryIds = {
	'Мелитополь': {
		'Феникс': 'Феникс г.Мелитополь Кирова 50/1',
		'Рижский': 'РИЖСКИЙ г.Мелитополь 50 л Победы 29',
		'Новый Мелитополь': 'Новый Мелитополь ул Гагарина 3',
		'Авоська': 'Авоська г.Мелитополь',
		'Черный': 'Черный г. Мелитополь Богдана Хмельницкого 89',
		'Парк': 'Черный г. Мелитополь Богдана Хмельницкого 89',
	},
	'Бердянск': {
		'Авокадо': 'АВОКАДО г. Бердянск пр Победы 11Б',
		'Кировский': 'КИРОВСКИЙ г. Бердянск ул волонтеров 49Б',
		'ЖД': 'ЖД г. Бердянск пр Восточный 119',
		'Гайдара': 'Гайдара г. Бердянск бул Шевченко 12а',
		'Fox': 'Fox г. Бердянск ул Университетская 16',
	},
	'Приморск': {
		'Центр': 'Центр г. Приморск ул Дружбы 15Б',
	}
}

const client = new Client({
	domain: process.env.AMO_LOGIN!,
	auth: {
		bearer: process.env.AMO_TOKEN!
	},
});


export async function getContact(name, phone, telegram, id)  {
	console.log(name, phone, telegram, id)
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
	await newContact.save();
	return newContact;
}

export async function newLead(contact, shop, city, delivery, qrLink) {
	const lead = new client.Lead('123');
	lead.pipeline_id = pipelines[shop]
	// lead.status_id = pipelines[shop].statusId
	lead.custom_fields_values = [
		{
			field_id: 1770867, // qr
			values: [{value: qrLink}]
		},
		{
			field_id: 1376389, // delivery HERES DROPDOWN LIST
			values: [{value: deliveryIds[city][delivery]}]
		}
	]

	lead.embeddedContacts.add([
		contact
	]);

	await lead.save();
	return lead
}

export async function getLeads(ids) {
	console.log(ids)
	const response = await client.request.get('/api/v4/leads', {
		filter: {
			id: ids
		}
	})
	const leads = response.data._embedded?.leads
	let message = ``
	leads.forEach(lead => {
		message += `${lead.name}: ${pipelinesReverse[lead.pipeline_id]}: ${statuses[lead.pipeline_id][lead.status_id]}\n\n`
	});
	console.dir(response.data._embedded?.leads)
	return message

}

