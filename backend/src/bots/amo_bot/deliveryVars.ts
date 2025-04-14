// @ts-nocheck

import { InlineKeyboard } from "grammy";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1XHjU4gR3b9Kbw8QIf4vqRPBmW8JZ1pHoV_MKiVm2330/gviz/tq?tqx=out:csv";


export let cities = new InlineKeyboard()
									.text('Мелитополь')
									.text('Бердянск').row()
									.text('Приморск').row()

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
		keyboard: new InlineKeyboard()
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
Adress text\n\n
Adress text\n\n
Adress text\n\n
		`,
		keyboard: new InlineKeyboard()
									.text('Центр')
									.text('Point')
									.text('Point').row()
	},
	'с. Азовское': {
		text: `
«Луначарск» ▶️ с. Азовское ул Центральная 95а
		`,
		keyboard: new InlineKeyboard()
									.text('Луначарск')
	}
}

export async function updatePoints() {
	try {
	  const response = await fetch(SHEET_URL);
	  const csvText = await response.text();
	  const rows = csvText
		.split("\n")
		.map((row) => row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));

    let lastCity = "";
    const result = {};

    rows.forEach((row, index) => {
      if (index === 0 || row.length < 4) return;

      const city = row[0] || lastCity;
      const name = row[1];
      const nameAmo = row[2];
      const nameBot = row[3];
  
		if (city) lastCity = city;
  
		if (!result[city]) {
		  result[city] = [];
		}
		result[city].push({ name, nameAmo, nameBot });
	  });
  
	  deliveryIds = idBuilder(result);
	  deliveryPoints = pointsBuilder(result);
	  cities = parseCities(result);
  
	  console.log("✅ Данные успешно загружены");
	  return true;
	} catch (error) {
	  console.error("❌ Ошибка при загрузке данных:", error);
	  return false;
	}
  }
  
  function idBuilder(data) {
	const deliveryIds = {};
	for (const city in data) {
	  deliveryIds[city] = {};
	  data[city].forEach((punkt) => {
		deliveryIds[city][punkt.name] = punkt.nameAmo;
	  });
	}
	return deliveryIds;
  }
  
  function pointsBuilder(data) {
	const deliveryPoints = {};
	for (const city in data) {
	  const keyboard = new InlineKeyboard();
	  let text = "";
	  let i = 1;
	  data[city].forEach((punkt) => {
		text += `${punkt.nameBot}\n\n`;
		if (i % 2 === 0) {
		  keyboard.text(punkt.name).row();
		} else {
		  keyboard.text(punkt.name);
		}
		i++;
	  });
	  deliveryPoints[city] = { text, keyboard };
	}
	return deliveryPoints;
  }
  
  function parseCities(data) {
	let i = 1;
	const keyboard = new InlineKeyboard();
	for (const city in data) {
	  if (i % 2 === 0) {
		keyboard.text(city).row();
	  } else {
		keyboard.text(city);
	  }
	  i++;
	}
	return keyboard;
  }
  
updatePoints();
