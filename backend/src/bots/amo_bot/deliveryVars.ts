// @ts-nocheck

import { InlineKeyboard } from "grammy";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1XHjU4gR3b9Kbw8QIf4vqRPBmW8JZ1pHoV_MKiVm2330/gviz/tq?tqx=out:csv";


export let cities = new InlineKeyboard()
									.text('City')
									.text('City').row()
									.text('City').row()
									.text('❌ Отменить')

export let deliveryIds = {
	'City': {
		'Point': 'Address',
	},
}
export let deliveryPoints = {
	'City': {
		text: `
Adress text\n\n
Adress text\n\n
Adress text\n\n
		`,
		keyboard: new InlineKeyboard()
									.text('Point')
									.text('Point').row()
	},
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
