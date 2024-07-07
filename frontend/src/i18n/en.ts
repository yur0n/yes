import messages from 'ra-language-english';

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
					name: 'Client |||| Clients',
					fields: {
							phone: 'Phone',
							id: 'Phone',
							name: 'Name',
							username: 'Username',
							note: 'Note',
							telegram: 'Telegram',
					},
			},
			messages: {
					name: 'Message |||| Messages',
					fields: {
							message: 'Message',
							date: 'Date',
					}
			}
	},
	server: {
			res: {
					201: 'Message sent',
					207: 'Error sending message to some users',
					400: 'Error sending message',
			},
	},
	custom: {
			action: {
					sendMessage: 'Send message',
					bulkSendMessage: 'Send to all',
					send: 'Send',
					cancel: 'Cancel',
			},
			fields: {
					chat: 'Chat',
					summary: 'Summary',
			},
			labels: {
					message: 'Message',
					writeMessage: 'Write message',
			},
	},
};