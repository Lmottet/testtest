import { spawnShards } from "./shardingManager.ts";
import { endpoints } from "../constants/discord.ts";
import { RequestManager } from "./requestManager.ts";
export let authorization = "";
export let botID = "";
export let eventHandlers = {};
export let botGatewayData;
export const identifyPayload = {
    token: "",
    compress: true,
    properties: {
        $os: "linux",
        $browser: "Discordeno",
        $device: "Discordeno",
    },
    intents: 0,
    shard: [0, 0],
};
export const createClient = async (data) => {
    if (data.eventHandlers)
        eventHandlers = data.eventHandlers;
    authorization = `Bot ${data.token}`;
    botGatewayData = await RequestManager.get(endpoints.GATEWAY_BOT);
    identifyPayload.token = data.token;
    identifyPayload.intents = data.intents.reduce((bits, next) => (bits |= next), 0);
    identifyPayload.shard = [0, botGatewayData.shards];
    spawnShards(botGatewayData, identifyPayload);
};
export default createClient;
export function updateEventHandlers(newEventHandlers) {
    eventHandlers = newEventHandlers;
}
export function setBotID(id) {
    if (botID !== id)
        botID = id;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXJELE1BQU0sQ0FBQyxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDOUIsTUFBTSxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUV0QixNQUFNLENBQUMsSUFBSSxhQUFhLEdBQWtCLEVBQUUsQ0FBQztBQUU3QyxNQUFNLENBQUMsSUFBSSxjQUFxQyxDQUFDO0FBRWpELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBb0I7SUFDOUMsS0FBSyxFQUFFLEVBQUU7SUFDVCxRQUFRLEVBQUUsSUFBSTtJQUNkLFVBQVUsRUFBRTtRQUNWLEdBQUcsRUFBRSxPQUFPO1FBQ1osUUFBUSxFQUFFLFlBQVk7UUFDdEIsT0FBTyxFQUFFLFlBQVk7S0FDdEI7SUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNWLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDZCxDQUFDO0FBY0YsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxJQUFtQixFQUFFLEVBQUU7SUFDeEQsSUFBSSxJQUFJLENBQUMsYUFBYTtRQUFFLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzNELGFBQWEsR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUdwQyxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsR0FBRyxDQUN2QyxTQUFTLENBQUMsV0FBVyxDQUNHLENBQUM7SUFFM0IsZUFBZSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ25DLGVBQWUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQzNDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQzlCLENBQUMsQ0FDRixDQUFDO0lBQ0YsZUFBZSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkQsV0FBVyxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQztBQUU1QixNQUFNLFVBQVUsbUJBQW1CLENBQUMsZ0JBQStCO0lBQ2pFLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxFQUFVO0lBQ2pDLElBQUksS0FBSyxLQUFLLEVBQUU7UUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQy9CLENBQUMifQ==