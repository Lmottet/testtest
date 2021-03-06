import { botHasChannelPermissions } from "../utils/permissions.ts";
import { Permissions } from "../types/permission.ts";
import { Errors } from "../types/errors.ts";
import { RequestManager } from "../module/requestManager.ts";
import { endpoints } from "../constants/discord.ts";
import { urlToBase64 } from "../utils/utils.ts";
import { structures } from "../structures/mod.ts";
export async function createWebhook(channelID, options) {
    if (!botHasChannelPermissions(channelID, [Permissions.MANAGE_WEBHOOKS])) {
        throw new Error(Errors.MISSING_MANAGE_WEBHOOKS);
    }
    if (options.name === "clyde" ||
        [...options.name].length < 2 || [...options.name].length > 32) {
        throw new Error(Errors.INVALID_WEBHOOK_NAME);
    }
    return RequestManager.post(endpoints.CHANNEL_WEBHOOKS(channelID), {
        ...options,
        avatar: options.avatar ? await urlToBase64(options.avatar) : undefined,
    });
}
export async function executeWebhook(webhookID, webhookToken, options) {
    if (!options.content && !options.file && !options.embeds) {
        throw new Error(Errors.INVALID_WEBHOOK_OPTIONS);
    }
    if (options.embeds && options.embeds.length > 10) {
        options.embeds.splice(10);
    }
    if (options.mentions) {
        if (options.mentions.users?.length) {
            if (options.mentions.parse.includes("users")) {
                options.mentions.parse = options.mentions.parse.filter((p) => p !== "users");
            }
            if (options.mentions.users.length > 100) {
                options.mentions.users = options.mentions.users.slice(0, 100);
            }
        }
        if (options.mentions.roles?.length) {
            if (options.mentions.parse.includes("roles")) {
                options.mentions.parse = options.mentions.parse.filter((p) => p !== "roles");
            }
            if (options.mentions.roles.length > 100) {
                options.mentions.roles = options.mentions.roles.slice(0, 100);
            }
        }
    }
    const result = await RequestManager.post(`${endpoints.WEBHOOK(webhookID, webhookToken)}${options.wait ? "?wait=true" : ""}`, {
        ...options,
        allowed_mentions: options.mentions,
        avatar_url: options.avatar_url,
    });
    if (!options.wait)
        return;
    return structures.createMessage(result);
}
export function getWebhook(webhookID) {
    return RequestManager.get(endpoints.WEBHOOK_ID(webhookID));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViaG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYmhvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFNbEQsTUFBTSxDQUFDLEtBQUssVUFBVSxhQUFhLENBQ2pDLFNBQWlCLEVBQ2pCLE9BQTZCO0lBRTdCLElBQ0UsQ0FBQyx3QkFBd0IsQ0FDdkIsU0FBUyxFQUNULENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUM5QixFQUNEO1FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUNqRDtJQUVELElBRUUsT0FBTyxDQUFDLElBQUksS0FBSyxPQUFPO1FBRXhCLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQzdEO1FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUM5QztJQUVELE9BQU8sY0FBYyxDQUFDLElBQUksQ0FDeEIsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUNyQztRQUNFLEdBQUcsT0FBTztRQUNWLE1BQU0sRUFBRSxPQUFP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