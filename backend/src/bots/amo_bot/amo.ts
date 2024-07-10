// @ts-nocheck

import { Client } from 'amocrm-js'

const client = new Client({
	domain: process.env.AMO_LOGIN!,
	auth: {
		bearer: process.env.AMO_TOKEN!
	},
});


async function getContact(name, phone, city, delivery, id)  {
	const contact = await client.contacts.getById(id);
	if (contact) return contact;

	const newContact = new client.Contact;
	newContact.name = name;
	newContact.custom_fields_values = [{
		field_id: 1174897, //phone
		values: [{value: phone}]
	}];
	await newContact.save();
	return newContact;
}