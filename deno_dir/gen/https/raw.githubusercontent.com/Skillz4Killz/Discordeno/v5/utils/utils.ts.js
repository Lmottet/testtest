import { ActivityType } from "../types/activity.ts";
import { sendGatewayCommand } from "../module/shardingManager.ts";
export const sleep = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};
export function editBotsStatus(status, name, type = ActivityType.Game) {
    sendGatewayCommand("EDIT_BOTS_STATUS", { status, game: { name, type } });
}
export function chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFbEUsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7SUFDdkMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUMsQ0FBQztBQUVGLE1BQU0sVUFBVSxjQUFjLENBQzVCLE1BQWtCLEVBQ2xCLElBQWEsRUFDYixJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUk7SUFFeEIsa0JBQWtCLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBSSxLQUFVO0lBQ3hDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUMifQ==