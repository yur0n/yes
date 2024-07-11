// @ts-nocheck

import { Client } from 'amocrm-js'
import { pipeline } from 'stream';

const pipelines = {
	'OZON': {
		pipelineId: 7000654,
		statusId: 58771906
	},
	'WB': {
		pipelineId: 7022614,
		statusId: 58920302
	},
	'YA': {
		pipelineId: 7260770,
		statusId: 58771906
	},
	'ZY': {
		pipelineId: 7260794,
		statusId: 60533134
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

export async function getContact(id) {
	const contact = await client.contacts.getById(id);
	if (contact?.id) return contact;
}

export async function getOrNewContact(name, phone, telegram, id)  {
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
	lead.pipeline_id = pipelines[shop].pipelineId
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
}

