export async function deleteMsg(ctx: any, chat: number, msg: number) {
	try {
		await ctx.api.deleteMessage(chat, msg)
	} catch (e) {}
}

export async function deleteMsgTime(ctx: any, chat: number, msg: number, time = 2500) {
	await new Promise(resolve => setTimeout(resolve, time))
	try {
		await ctx.api.deleteMessage(chat, msg)
	} catch (e) {}
}

export async function replyAndDel(ctx: any, text: string, time = 2500) {
	const msg = await ctx.reply(text)
	await new Promise(resolve => setTimeout(resolve, time))
	try {
		await ctx.api.deleteMessage(msg.chat.id, msg.message_id)
	} catch (e) {}
}