import { GatewayOpcode, } from "../types/discord.ts";
import { eventHandlers, botGatewayData, identifyPayload, botID, setBotID, } from "./client.ts";
import { delay } from "https://deno.land/std@0.50.0/async/delay.ts";
import { handleInternalChannelCreate, handleInternalChannelUpdate, handleInternalChannelDelete, } from "../events/channels.ts";
import { createGuild } from "../structures/guild.ts";
import { handleInternalGuildCreate, handleInternalGuildDelete, } from "../events/guilds.ts";
import { cache } from "../utils/cache.ts";
import { createMember } from "../structures/member.ts";
import { createRole } from "../structures/role.ts";
import { createMessage } from "../structures/message.ts";
let shardCounter = 0;
const fetchAllMembersProcessingRequests = new Map();
const shards = [];
let createNextShard = true;
export function createShardWorker(shardID) {
    const path = new URL("./shard.ts", import.meta.url).toString();
    const shard = new Worker(path, { type: "module", deno: true });
    shard.onmessage = (message) => {
        if (message.data.type === "REQUEST_CLIENT_OPTIONS") {
            identifyPayload.shard = [
                shardID || shardCounter,
                botGatewayData.shards,
            ];
            shard.postMessage({
                type: "CREATE_SHARD",
                botGatewayData,
                identifyPayload,
                shardID: shardCounter,
            });
            shardCounter++;
        }
        else if (message.data.type === "HANDLE_DISCORD_PAYLOAD") {
            handleDiscordPayload(JSON.parse(message.data.payload), message.data.shardID);
        }
        else if (message.data.type === "DEBUG_LOG") {
            eventHandlers.debug?.(message.data.details);
        }
    };
    shards.push(shard);
}
export const spawnShards = async (data, payload, id = 1) => {
    if ((data.shards === 1 && id === 1) || id <= data.shards) {
        if (createNextShard) {
            createNextShard = false;
            createShardWorker();
            spawnShards(data, payload, id + 1);
        }
        else {
            await delay(1000);
            spawnShards(data, payload, id);
        }
    }
};
async function handleDiscordPayload(data, shardID) {
    eventHandlers.raw?.(data);
    switch (data.op) {
        case GatewayOpcode.HeartbeatACK:
            return eventHandlers.heartbeat?.();
        case GatewayOpcode.Dispatch:
            if (data.t === "READY") {
                setBotID(data.d.user.id);
                eventHandlers.ready?.();
                await delay(5000);
                createNextShard = true;
            }
            if (data.t === "CHANNEL_CREATE") {
                return handleInternalChannelCreate(data.d);
            }
            if (data.t === "CHANNEL_UPDATE") {
                return handleInternalChannelUpdate(data.d);
            }
            if (data.t === "CHANNEL_DELETE") {
                return handleInternalChannelDelete(data.d);
            }
            if (data.t === "GUILD_CREATE") {
                const options = data.d;
                if (cache.guilds.has(options.id)) {
                    return;
                }
                const guild = createGuild(data.d, shardID);
                handleInternalGuildCreate(guild);
                if (cache.unavailableGuilds.get(options.id)) {
                    cache.unavailableGuilds.delete(options.id);
                }
                return eventHandlers.guildCreate?.(guild);
            }
            if (data.t === "GUILD_UPDATE") {
                const options = data.d;
                const cachedGuild = cache.guilds.get(options.id);
                if (!cachedGuild)
                    return;
                const keysToSkip = [
                    "roles",
                    "guild_hashes",
                    "guild_id",
                    "max_members",
                    "emojis",
                ];
                const changes = Object.entries(options)
                    .map(([key, value]) => {
                    if (keysToSkip.includes(key))
                        return;
                    const cachedValue = cachedGuild[key];
                    if (cachedValue !== value) {
                        if (!cachedValue && !value)
                            return;
                        if (Array.isArray(cachedValue) && Array.isArray(value)) {
                            const different = (cachedValue.length !== value.length) ||
                                cachedValue.find((val) => !value.includes(val)) ||
                                value.find((val) => !cachedValue.includes(val));
                            if (!different)
                                return;
                        }
                        cachedGuild[key] = value;
                        return { key, oldValue: cachedValue, value };
                    }
                    return;
                }).filter((change) => change);
                return eventHandlers.guildUpdate?.(cachedGuild, changes);
            }
            if (data.t === "GUILD_DELETE") {
                const options = data.d;
                const guild = cache.guilds.get(options.id);
                if (!guild)
                    return;
                guild.channels.forEach((channel) => cache.channels.delete(channel.id));
                cache.messages.forEach((message) => {
                    if (message.guildID === guild.id)
                        cache.messages.delete(message.id);
                });
                if (options.unavailable) {
                    return cache.unavailableGuilds.set(options.id, Date.now());
                }
                handleInternalGuildDelete(guild);
                return eventHandlers.guildDelete?.(guild);
            }
            if (data.t && ["GUILD_BAN_ADD", "GUILD_BAN_REMOVE"].includes(data.t)) {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const member = guild.members.get(options.user.id);
                return data.t === "GUILD_BAN_ADD"
                    ? eventHandlers.guildBanAdd?.(guild, member || options.user)
                    : eventHandlers.guildBanRemove?.(guild, member || options.user);
            }
            if (data.t === "GUILD_EMOJIS_UPDATE") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const cachedEmojis = guild.emojis;
                guild.emojis = options.emojis;
                return eventHandlers.guildEmojisUpdate?.(guild, options.emojis, cachedEmojis);
            }
            if (data.t === "GUILD_MEMBER_ADD") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const memberCount = guild.memberCount + 1;
                guild.memberCount = memberCount;
                const member = createMember(options, guild);
                guild.members.set(options.user.id, member);
                return eventHandlers.guildMemberAdd?.(guild, member);
            }
            if (data.t === "GUILD_MEMBER_REMOVE") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const memberCount = guild.memberCount - 1;
                guild.memberCount = memberCount;
                const member = guild.members.get(options.user.id);
                return eventHandlers.guildMemberRemove?.(guild, member || options.user);
            }
            if (data.t === "GUILD_MEMBER_UPDATE") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const cachedMember = guild.members.get(options.user.id);
                const newMemberData = {
                    ...options,
                    premium_since: options.premium_since || undefined,
                    joined_at: new Date(cachedMember?.joinedAt || Date.now())
                        .toISOString(),
                    deaf: cachedMember?.deaf || false,
                    mute: cachedMember?.mute || false,
                };
                const member = createMember(newMemberData, guild);
                guild.members.set(options.user.id, member);
                if (cachedMember?.nick !== options.nick) {
                    eventHandlers.nicknameUpdate?.(guild, member, options.nick, cachedMember?.nick);
                }
                const roleIDs = cachedMember?.roles || [];
                roleIDs.forEach((id) => {
                    if (!options.roles.includes(id)) {
                        eventHandlers.roleLost?.(guild, member, id);
                    }
                });
                options.roles.forEach((id) => {
                    if (!roleIDs.includes(id)) {
                        eventHandlers.roleGained?.(guild, member, id);
                    }
                });
                return eventHandlers.guildMemberUpdate?.(guild, member, cachedMember);
            }
            if (data.t === "GUILD_MEMBERS_CHUNK") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                options.members.forEach((member) => {
                    guild.members.set(member.user.id, createMember(member, guild));
                });
                if (options.nonce) {
                    const resolve = fetchAllMembersProcessingRequests.get(options.nonce);
                    if (!resolve)
                        return;
                    if (options.chunk_index + 1 === options.chunk_count) {
                        fetchAllMembersProcessingRequests.delete(options.nonce);
                        resolve();
                    }
                }
            }
            if (data.t === "GUILD_ROLE_DELETE") {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                const cachedRole = guild.roles.get(options.role_id);
                guild.roles.delete(options.role_id);
                return eventHandlers.roleDelete?.(guild, cachedRole);
            }
            if (data.t &&
                ["GUILD_ROLE_CREATE", "GUILD_ROLE_UPDATE"]
                    .includes(data.t)) {
                const options = data.d;
                const guild = cache.guilds.get(options.guild_id);
                if (!guild)
                    return;
                if (data.t === "GUILD_ROLE_CREATE") {
                    const role = createRole(options.role);
                    const roles = guild.roles.set(options.role.id, role);
                    guild.roles = roles;
                    return eventHandlers.roleCreate?.(guild, role);
                }
                const cachedRole = guild.roles.get(options.role.id);
                if (!cachedRole)
                    return;
                if (data.t === "GUILD_ROLE_UPDATE") {
                    const role = createRole(options.role);
                    return eventHandlers.roleUpdate?.(guild, role, cachedRole);
                }
            }
            if (data.t === "MESSAGE_CREATE") {
                const options = data.d;
                const channel = cache.channels.get(options.channel_id);
                if (channel)
                    channel.lastMessageID = options.id;
                const message = createMessage(options);
                cache.messages.set(options.id, message);
                const guild = options.guild_id
                    ? cache.guilds.get(options.guild_id)
                    : undefined;
                if (options.member) {
                    guild?.members.set(options.author.id, createMember({ ...options.member, user: options.author }, guild));
                }
                options.mentions.forEach((mention) => {
                    if (mention.member) {
                        guild?.members.set(mention.id, createMember({ ...mention.member, user: mention }, guild));
                    }
                });
                return eventHandlers.messageCreate?.(message);
            }
            if (data.t && ["MESSAGE_DELETE", "MESSAGE_DELETE_BULK"].includes(data.t)) {
                const options = data.d;
                const deletedMessages = data.t === "MESSAGE_DELETE"
                    ? [options.id]
                    : data.d.ids;
                const channel = cache.channels.get(options.channel_id);
                if (!channel)
                    return;
                deletedMessages.forEach((id) => {
                    const message = cache.messages.get(id);
                    if (!message)
                        return;
                    eventHandlers.messageDelete?.(message || { id, channel });
                    cache.messages.delete(id);
                });
            }
            if (data.t === "MESSAGE_UPDATE") {
                const options = data.d;
                const channel = cache.channels.get(options.channel_id);
                if (!channel)
                    return;
                const cachedMessage = cache.messages.get(options.id);
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
                if (!options.edited_timestamp ||
                    (cachedMessage.content !== options.content)) {
                    return;
                }
                return eventHandlers.messageUpdate?.(cachedMessage, oldMessage);
            }
            if (data.t &&
                ["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(data.t)) {
                const options = data.d;
                const message = cache.messages.get(options.message_id);
                const isAdd = data.t === "MESSAGE_REACTION_ADD";
                if (message) {
                    const previousReactions = message.reactions;
                    const reactionExisted = previousReactions?.find((reaction) => reaction.emoji.id === options.emoji.id &&
                        reaction.emoji.name === options.emoji.name);
                    if (reactionExisted) {
                        reactionExisted.count = isAdd
                            ? reactionExisted.count + 1
                            : reactionExisted.count - 1;
                    }
                    else {
                        const newReaction = {
                            count: 1,
                            me: options.user_id === botID,
                            emoji: { ...options.emoji, id: options.emoji.id || undefined },
                        };
                        message.reactions = message.reactions
                            ? [...message.reactions, newReaction]
                            : [newReaction];
                    }
                    cache.messages.set(options.message_id, message);
                }
                if (options.member && options.guild_id) {
                    const guild = cache.guilds.get(options.guild_id);
                    guild?.members.set(options.member.user.id, createMember(options.member, guild));
                }
                return isAdd
                    ? eventHandlers.reactionAdd?.(message || options, options.emoji, options.user_id)
                    : eventHandlers.reactionRemove?.(message || options, options.emoji, options.user_id);
            }
            if (data.t === "MESSAGE_REACTION_REMOVE_ALL") {
                return eventHandlers.reactionRemoveAll?.(data.d);
            }
            if (data.t === "MESSAGE_REACTION_REMOVE_EMOJI") {
                return eventHandlers.reactionRemoveEmoji?.(data.d);
            }
            if (data.t === "PRESENCE_UPDATE") {
                return eventHandlers.presenceUpdate?.(data.d);
            }
            if (data.t === "TYPING_START") {
                return eventHandlers.typingStart?.(data.d);
            }
            if (data.t === "USER_UPDATE") {
                const userData = data.d;
                cache.guilds.forEach((guild) => {
                    const member = guild.members.get(userData.id);
                    if (!member)
                        return;
                    Object.entries(userData).forEach(([key, value]) => {
                        if (member[key] === value)
                            return;
                        member[key] = value;
                    });
                });
                return eventHandlers.botUpdate?.(userData);
            }
            if (data.t === "VOICE_STATE_UPDATE") {
                const payload = data.d;
                if (!payload.guild_id)
                    return;
                const guild = cache.guilds.get(payload.guild_id);
                if (!guild)
                    return;
                const member = guild.members.get(payload.user_id) ||
                    (payload.member ? createMember(payload.member, guild) : undefined);
                if (!member)
                    return;
                const cachedState = guild.voiceStates.get(payload.user_id);
                if (!cachedState) {
                    guild.voiceStates.set(payload.user_id, {
                        ...payload,
                        guildID: payload.guild_id,
                        channelID: payload.channel_id,
                        userID: payload.user_id,
                        sessionID: payload.session_id,
                        selfDeaf: payload.self_deaf,
                        selfMute: payload.self_mute,
                        selfStream: payload.self_stream,
                    });
                }
                if (cachedState?.channelID !== payload.channel_id) {
                    if (payload.channel_id) {
                        cachedState?.channelID
                            ?
                                eventHandlers.voiceChannelSwitch?.(member, payload.channel_id, cachedState.channelID)
                            :
                                eventHandlers.voiceChannelJoin?.(member, payload.channel_id);
                    }
                    else if (cachedState?.channelID) {
                        eventHandlers.voiceChannelLeave?.(member, cachedState.channelID);
                    }
                }
                return eventHandlers.voiceStateUpdate?.(member, payload);
            }
            if (data.t === "WEBHOOKS_UPDATE") {
                const options = data.d;
                return eventHandlers.webhooksUpdate?.(options.channel_id, options.guild_id);
            }
            return;
        default:
            return;
    }
}
export async function requestAllMembers(guild, resolve, options) {
    const nonce = Math.random().toString();
    fetchAllMembersProcessingRequests.set(nonce, resolve);
    shards[guild.shardID].postMessage({
        type: "FETCH_MEMBERS",
        guildID: guild.id,
        nonce,
        options,
    });
}
export function sendGatewayCommand(type, payload) {
    shards.forEach((shard) => {
        shard.postMessage({
            type,
            ...payload,
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmRpbmdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hhcmRpbmdNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCxhQUFhLEdBTWQsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQ0wsYUFBYSxFQUNiLGNBQWMsRUFDZCxlQUFlLEVBQ2YsS0FBSyxFQUNMLFFBQVEsR0FDVCxNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDcEUsT0FBTyxFQUNMLDJCQUEyQixFQUMzQiwyQkFBMkIsRUFDM0IsMkJBQTJCLEdBQzVCLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQUFFLFdBQVcsRUFBUyxNQUFNLHdCQUF3QixDQUFDO0FBZTVELE9BQU8sRUFDTCx5QkFBeUIsRUFDekIseUJBQXlCLEdBQzFCLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFTbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3pELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQVFyQixNQUFNLGlDQUFpQyxHQUFHLElBQUksR0FBRyxFQUc5QyxDQUFDO0FBQ0osTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0FBQzVCLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztBQUUzQixNQUFNLFVBQVUsaUJBQWlCLENBQUMsT0FBZ0I7SUFDaEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0QsTUFB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