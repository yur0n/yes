// @ts-nocheck

import { InlineKeyboard } from "grammy";
import sheetdb from 'sheetdb-node';

const config = {
  address: process.env.SHEETDB,
};

const client = sheetdb(config);

export let deliveryIds =  {}
export let deliveryPoints = {}

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
	deliveryIds = pointsBuilder(result);
	deliveryPoints = idBuilder(result);
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
		data[city].forEach(punkt => {
			text += punkt.nameBot + '\n\n';
			keyboard.text(punkt.name)
		})
		deliveryPoints[city] = { text, keyboard }
	}
	return deliveryPoints

}
