import messages from 'ra-language-russian';

export default {
	...messages,
	ra: {
		...messages.ra,
			action: {
				...messages.ra.action,
					edit: '',
			}
	},
	resources: {
			users: {
					name: 'Клиент |||| Клиенты',
					fields: {
							phone: 'Телефон',
							id: 'Телефон',
							name: 'Имя',
							username: 'Пользователь',
							note: 'Примечание',
							telegram: 'Телеграм',
					},
			},
			messages: {
					name: 'Сообщение |||| Сообщения',
					fields: {
							userId: 'Клиент',
							message: 'Сообщение',
							date: 'Дата',
					}
			}
	},
	server: {
			res: {
					201: 'Сообщение отправлено',
					207: 'Сообщения были отправлены не всем клиентам',
					400: 'Ошибка отправки сообщения',
			},
	},
	custom: {
			action: {
					sendMessage: 'Отправить сообщение',
					bulkSendMessage: 'Отправить всем',
					send: 'Отправить',
					cancel: 'Отмена',
			},
			fields: {
					chat: 'Чат',
					summary: 'Сводка',
			},
			labels: {
					message: 'Cообщение',
					writeMessage: 'Напишите сообщение',
			},
	},
};