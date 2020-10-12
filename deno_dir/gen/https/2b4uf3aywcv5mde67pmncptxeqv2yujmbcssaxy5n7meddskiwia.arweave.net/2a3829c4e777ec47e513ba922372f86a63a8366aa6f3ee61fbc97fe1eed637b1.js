import { Permissions } from "../types/permission.ts";
import { botID } from "../module/client.ts";
import { cacheHandlers } from "../controllers/cache.ts";
export async function memberIDHasPermission(memberID, guildID, permissions) {
    const guild = await cacheHandlers.get("guilds", guildID);
    if (!guild)
        return false;
    if (memberID === guild.ownerID)
        return true;
    const member = guild.members.get(memberID);
    if (!member)
        return false;
    return memberHasPermission(member.guildID, guild, member.roles, permissions);
}
export function memberHasPermission(memberID, guild, memberRoleIDs, permissions) {
    if (memberID === guild.ownerID)
        return true;
    const permissionBits = memberRoleIDs.map((id) => guild.roles.get(id)?.permissions)
        .reduce((bits, permissions) => {
        bits |= BigInt(permissions);
        return bits;
    }, BigInt(0));
    if (permissionBits & BigInt(Permissions.ADMINISTRATOR))
        return true;
    return permissions.every((permission) => permissionBits & BigInt(Permissions[permission]));
}
export async function botHasPermission(guildID, permissions) {
    const guild = await cacheHandlers.get("guilds", guildID);
    if (!guild)
        return false;
    const member = guild.members.get(botID);
    if (!member)
        return false;
    const permissionBits = member.roles
        .map((id) => guild.roles.get(id))
        .reduce((bits, data) => {
        bits |= BigInt(data.permissions);
        return bits;
    }, BigInt(0));
    if (permissionBits & BigInt(Permissions.ADMINISTRATOR))
        return true;
    return permissions.every((permission) => permissionBits & BigInt(permission));
}
export function botHasChannelPermissions(channelID, permissions) {
    return hasChannelPermissions(channelID, botID, permissions);
}
export async function hasChannelPermissions(channelID, memberID, permissions) {
    const channel = await cacheHandlers.get("channels", channelID);
    if (!channel?.guildID)
        return true;
    const guild = await cacheHandlers.get("guilds", channel.guildID);
    if (!guild)
        return false;
    if (guild.ownerID === memberID)
        return true;
    if (botHasPermission(guild.id, [Permissions.ADMINISTRATOR]))
        return true;
    const member = guild.members.get(memberID);
    if (!member)
        return false;
    const memberOverwrite = channel.permission_overwrites?.find((o) => o.id === memberID);
    const rolesOverwrites = channel.permission_overwrites?.filter((o) => member.roles.includes(o.id));
    const everyoneOverwrite = channel.permission_overwrites?.find((o) => o.id === guild.id);
    const allowedPermissions = new Set();
    if (memberOverwrite) {
        if (permissions.some((perm) => BigInt(memberOverwrite.deny) & BigInt(perm))) {
            return false;
        }
        permissions.forEach((perm) => {
            if (allowedPermissions.has(perm))
                return;
            if (BigInt(memberOverwrite.allow) & BigInt(perm)) {
                allowedPermissions.add(perm);
            }
        });
    }
    if (rolesOverwrites?.length) {
        if (rolesOverwrites.some((overwrite) => permissions.some((perm) => (BigInt(overwrite.deny) & BigInt(perm)) &&
            !rolesOverwrites.some((o) => BigInt(o.allow) & BigInt(perm)) &&
            !(memberOverwrite && BigInt(memberOverwrite.allow) & BigInt(perm))))) {
            return false;
        }
        permissions.forEach((perm) => {
            if (allowedPermissions.has(perm))
                return;
            rolesOverwrites.forEach((overwrite) => {
                if (BigInt(overwrite.allow) & BigInt(perm)) {
                    allowedPermissions.add(perm);
                }
            });
        });
    }
    if (everyoneOverwrite) {
        if (permissions.some((perm) => BigInt(everyoneOverwrite.deny) & BigInt(perm) &&
            !allowedPermissions.has(perm))) {
            return false;
        }
        if (permissions.every((perm) => BigInt(everyoneOverwrite.allow) & BigInt(perm))) {
            return true;
        }
    }
    return botHasPermission(guild.id, permissions);
}
export function calculatePermissions(permissionBits) {
    return Object.keys(Permissions).filter((perm) => {
        if (typeof perm !== "number")
            return false;
        return permissionBits & BigInt(Permissions[perm]);
    });
}
export async function highestRole(guildID, memberID) {
    const guild = await cacheHandlers.get("guilds", guildID);
    if (!guild)
        return;
    const member = guild?.members.get(memberID);
    if (!member)
        return;
    let memberHighestRole;
    for (const roleID of member.roles) {
        const role = guild.roles.get(roleID);
        if (!role)
            continue;
        if (!memberHighestRole || memberHighestRole.position < role.position) {
            memberHighestRole = role;
        }
    }
    return memberHighestRole || guild.roles.get(guild.id);
}
export async function higherRolePosition(guildID, roleID, otherRoleID) {
    const guild = await cacheHandlers.get("guilds", guildID);
    if (!guild)
        return;
    const role = guild.roles.get(roleID);
    const otherRole = guild.roles.get(otherRoleID);
    if (!role || !otherRole)
        return;
    if (role.position === otherRole.position) {
        return role.id < otherRole.id;
    }
    return role.position > otherRole.position;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybWlzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwZXJtaXNzaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUd4RCxNQUFNLENBQUMsS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFnQixFQUNoQixPQUFlLEVBQ2YsV0FBeUI7SUFFekIsTUFBTSxLQUFLLEdBQUcsTUFBTSxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRXpCLElBQUksUUFBUSxLQUFLLEtBQUssQ0FBQyxPQUFPO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLE1BQU07UUFBRSxPQUFPLEtBQUssQ0FBQztJQUUxQixPQUFPLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUdELE1BQU0sVUFBVSxtQkFBbUIsQ0FDakMsUUFBZ0IsRUFDaEIsS0FBWSxFQUNaLGFBQXVCLEVBQ3ZCLFdBQXlCO0lBRXpCLElBQUksUUFBUSxLQUFLLEtBQUssQ0FBQyxPQUFPO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFNUMsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQzlDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUs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