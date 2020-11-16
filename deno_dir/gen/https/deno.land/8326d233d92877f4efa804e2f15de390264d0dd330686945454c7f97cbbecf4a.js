import { eventHandlers } from "../module/client.ts";
import { structures } from "../structures/mod.ts";
import { cacheHandlers } from "./cache.ts";
export async function handleInternalMessageCreate(data) {
    if (data.t !== "MESSAGE_CREATE")
        return;
    const payload = data.d;
    const channel = await cacheHandlers.get("channels", payload.channel_id);
    if (channel)
        channel.lastMessageID = payload.id;
    const guild = payload.guild_id
        ? await cacheHandlers.get("guilds", payload.guild_id)
        : undefined;
    if (payload.member) {
        guild?.members.set(payload.author.id, await structures.createMember({ ...payload.member, user: payload.author }, guild.id));
    }
    payload.mentions.forEach(async (mention) => {
        if (mention.member) {
            guild?.members.set(mention.id, await structures.createMember({ ...mention.member, user: mention }, guild.id));
        }
    });
    const message = await structures.createMessage(payload);
    cacheHandlers.set("messages", payload.id, message);
    eventHandlers.messageCreate?.(message);
}
export async function handleInternalMessageDelete(data) {
    if (data.t !== "MESSAGE_DELETE")
        return;
    const payload = data.d;
    const channel = await cacheHandlers.get("channels", payload.channel_id);
    if (!channel)
        return;
    eventHandlers.messageDelete?.(await cacheHandlers.get("messages", payload.id) ||
        { id: payload.id, channel });
    cacheHandlers.delete("messages", payload.id);
}
export async function handleInternalMessageDeleteBulk(data) {
    if (data.t !== "MESSAGE_DELETE_BULK")
        return;
    const payload = data.d;
    const channel = await cacheHandlers.get("channels", payload.channel_id);
    if (!channel)
        return;
    payload.ids.forEach(async (id) => {
        eventHandlers.messageDelete?.(await cacheHandlers.get("messages", id) || { id, channel });
        cacheHandlers.delete("messages", id);
    });
}
export async function handleInternalMessageUpdate(data) {
    if (data.t !== "MESSAGE_UPDATE")
        return;
    const payload = data.d;
    const channel = await cacheHandlers.get("channels", payload.channel_id);
    if (!channel)
        return;
    const cachedMessage = await cacheHandlers.get("messages", payload.id);
    if (!cachedMessage)
        return;
    const oldMessage = {
        attachments: cachedMessage.attachments,
        content: cachedMessage.content,
        embeds: cachedMessage.embeds,
        editedTimestamp: cachedMessage.editedTimestamp,
        tts: cachedMessage.tts,
        pinned: cachedMessage.pinned,
    };
    if (!payload.edited_timestamp ||
        (cachedMessage.content !== payload.content)) {
        return;
    }
    eventHandlers.messageUpdate?.(cachedMessage, oldMessage);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBT2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFM0MsTUFBTSxDQUFDLEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxJQUFvQjtJQUNwRSxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssZ0JBQWdCO1FBQUUsT0FBTztJQUV4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBeUIsQ0FBQztJQUMvQyxNQUFNLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4RSxJQUFJLE9BQU87UUFBRSxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFFaEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVE7UUFDNUIsQ0FBQyxDQUFDLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNyRCxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRWQsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBRWxCLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFDakIsTUFBTSxVQUFVLENBQUMsWUFBWSxDQUMzQixFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUMzQyxLQUFLLENBQUMsRUFBRSxDQUNULENBQ0YsQ0FBQztLQUNIO0lBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxF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