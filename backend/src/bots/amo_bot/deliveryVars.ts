// @ts-nocheck

import { InlineKeyboard } from "grammy";
import sheetdb from 'sheetdb-node';

const config = {
  address: process.env.SHEETDB,
};

const client = sheetdb(config);

export let cities = new InlineKeyboard()
									.text('Мелитополь')
									.text('Бердянск').row()
									.text('Приморск').row()
									.text('❌ Отменить')

export let deliveryIds = {
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
	},
	'с. Азовское': {
		'Луначарск': 'Луначарск с. Азовское ул Центральная 95 а'
	},         
}
export let deliveryPoints = {
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
		keyboard: new InlineKeyboard()
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
	},
	'с. Азовское': {
		text: `
«Луначарск» ▶️ с. Азовское ул Центральная 95а
		`,
		keyboard: () => new InlineKeyboard()
									.text('Луначарск')
	}
}

updatePoints();

export async function updatePoints() {
	let data;
	await client.read({ sheet: "Sheet1" }).then(res => {
		data = JSON.parse(res);
		
		}, function(err) {
			console.log(err);
	});

	let lastCity = ''
	const result = {}
	data.forEach(d => {
		let city = d['Город']
		if (city == '') {
			city = lastCity;
		} else {
			lastCity = city;
		}
		const name = d['Пункт']
		const nameAmo = d['Пункт в АМО']
		const nameBot = d['Пункт в сообщении бота']

		if (!result[city]) {
			result[city] = [];
		}
		result[city].push({ name, nameAmo, nameBot });
	})
	deliveryIds = idBuilder(result);
	deliveryPoints = pointsBuilder(result);
	cities = parseCities(result)
}

function idBuilder(data) {
	const deliveryIds = {};

	for (const city of Object.keys(data)) {
		data[city].forEach(punkt => {
			const name = punkt.name;
			const nameAmo = punkt.nameAmo;
			deliveryIds[city] = { ...deliveryIds[city], [name]: nameAmo }
		})
	}
	return deliveryIds
}

function pointsBuilder(data) {
	const deliveryPoints = {};

	for (const city of Object.keys(data)) {
		const keyboard = new InlineKeyboard()
		let text = ''
		let i = 1;
		data[city].forEach(punkt => {
			text += punkt.nameBot + '\n\n';
			if (i % 2 == 0) {
				keyboard.text(punkt.name).row();
			} else {
				keyboard.text(punkt.name)
			}
			i++
		})
		deliveryPoints[city] = { text, keyboard }
	}
	return deliveryPoints

}

function parseCities(data) {
	let i = 1;
	const keyboard = new InlineKeyboard();
	for (const city of Object.keys(data)) {
		if (i % 2 == 0) {
			keyboard.text(city).row();
		} else {
			keyboard.text(city)
		}
		i++
	}
	return keyboard;
}
