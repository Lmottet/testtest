import { ActivityType } from "../types/activity.ts";
import { sendGatewayCommand } from "../module/shardingManager.ts";
import { encode } from "https://deno.land/std@0.61.0/encoding/base64.ts";
export const sleep = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};
export function editBotsStatus(status, name, type = ActivityType.Game) {
    sendGatewayCommand("EDIT_BOTS_STATUS", { status, game: { name, type } });
}
export function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
export async function urlToBase64(url) {
    const buffer = await fetch(url).then((res) => res.arrayBuffer());
    const imageStr = encode(buffer);
    const type = url.substring(url.lastIndexOf(".") + 1);
    return `data:image/${type};base64,${imageStr}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDbEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBRXpFLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFO0lBQ3ZDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNoRSxDQUFDLENBQUM7QUFVRixNQUFNLFVBQVUsY0FBYyxDQUM1QixNQUFrQixFQUNsQixJQUFhLEVBQ2IsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJO0lBRXhCLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUksS0FBVTtJQUN4QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxXQUFXLENBQUMsR0FBVztJQUMzQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckQsT0FBTyxjQUFjLElBQUksV0FBVyxRQUFRLEVBQUUsQ0FBQztBQUNqRCxDQUFDIn0=