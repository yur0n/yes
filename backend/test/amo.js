// import { Client } from 'amocrm-js'

// const client = new Client({
// 	// логин пользователя в портале, где адрес портала domain.amocrm.ru
// 	domain: process.env.AMO_LOGIN, // может быть указан полный домен вида domain.amocrm.ru, domain.amocrm.com
// 	/* 
// 		Информация об интеграции (подробности подключения 
// 		описаны на https://www.amocrm.ru/developers/content/oauth/step-by-step)
// 	*/
// 	auth: {
// 		// client_id: '2416b19f-bd97-41ba-8e6a-fa917e154ef5', // ID интеграции
// 		// client_secret: 'clientSecret', // Секретный ключ
// 		// redirect_uri: 'redirectUri', // Ссылка для перенаправления
// 		bearer: process.env.AMO_TOKEN, // долгосрочный токен
// 	},
// });

// let lead = await client.leads.getById(48849145)
// console.log(lead.custom_fields_values[0].values)

// const contact1 = await client.contacts.getById(67861845);
// console.log(contact1.custom_fields_values[0].values)

// const contact = new client.Contact;
// contact.name = 'TESTER TEST';
// contact.custom_fields_values = [{
// 	field_id: 1174897,
// 	values: [{value: '123456789'}]
// }]
// await contact.save();

// const lead = new client.Lead('123');
// lead.pipeline_id = 7022614
// lead.custom_fields_values = [
// 	{
// 		field_id: 1770867,
// 		values: [{value: 'https://chencnik.amocrm.ru/leads/detail/48850183'}]
// 	}
// ]

// lead.embeddedContacts.add([
// 	contact
// ]);

// await lead.save();


const domain = 'https://chencnik.amocrm.ru/api/v4/leads/pipelines/7022614/statuses'
const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRmZmI2MmNlYzQ0YmE5Yzc5ZTg4ODBlODk1YTkzZTg5ZDc3YzNlOTU5NWM1MGJkM2RhYzg1YjljZTMyMzUwZjczNGUxOTlkOTZlYTY3YjZlIn0.eyJhdWQiOiIyNDE2YjE5Zi1iZDk3LTQxYmEtOGU2YS1mYTkxN2UxNTRlZjUiLCJqdGkiOiJkZmZiNjJjZWM0NGJhOWM3OWU4ODgwZTg5NWE5M2U4OWQ3N2MzZTk1OTVjNTBiZDNkYWM4NWI5Y2UzMjM1MGY3MzRlMTk5ZDk2ZWE2N2I2ZSIsImlhdCI6MTcyMDEyNTY5OCwibmJmIjoxNzIwMTI1Njk4LCJleHAiOjE4Nzc4MTc2MDAsInN1YiI6Ijk4MTgwMDYiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzExNjU1OTQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlMzEzMWEyNi1kOWVkLTQ2YTgtOTNlOC1kMjYzYjJiM2FiZTgifQ.jx7Yz4yAd1chyg6yi0tK0z5jLkKfoYrtEGWk7ox2MUzKxTI8P8A8sPMHXkQJRztzgWthhEIb6brd2D3aRyG6ekzAlx1wbloMiK9ttGxY3yL6-_AMbt0yfUEaSLlYASIq_96VZ3usp2RaSLY6fpuEoSPea9nxE376XvYyV2WBWylk4jyUe55yNp7Smah7yZaOWpWl1uO-bdk3PVUaGzNJ6hVhHShQLJoWdtLcFVUJZx43XbMzLRvr6032oYy0xGgY7GmntjisIgkzxepF16zROH7Y8djWlvnxDppR8ZmUrae5Kw-S7mjlHDXORRsw8HB1ZDctu0YjbbPNgHDzdVtOyg'
// import fs from 'fs'

// const file = fs.readFileSync('./Capture.jpg', 'UTF-8');
// const formData = new FormData();
// formData.append('part', 0)
// formData.append('file', file)

fetch(domain, {
	'User-Agent': 'amoCRM-oAuth-client/1.0',
	headers: {
		Authorization: `Bearer ${access_token}`
	},
}).then(r => r.json()).then(r => {
console.dir(r._embedded.statuses)
}).catch(console.log)



