export var UserFlags;
(function (UserFlags) {
    UserFlags[UserFlags["NONE"] = 0] = "NONE";
    UserFlags[UserFlags["DISCORD_EMPLOYEE"] = 1] = "DISCORD_EMPLOYEE";
    UserFlags[UserFlags["DISCORD_PARTNER"] = 2] = "DISCORD_PARTNER";
    UserFlags[UserFlags["HYPE_SQUAD_EVENTS"] = 4] = "HYPE_SQUAD_EVENTS";
    UserFlags[UserFlags["BUG_HUNTER"] = 8] = "BUG_HUNTER";
    UserFlags[UserFlags["HOUSE_BRAVERY"] = 64] = "HOUSE_BRAVERY";
    UserFlags[UserFlags["HOUSE_BRILLIANCE"] = 128] = "HOUSE_BRILLIANCE";
    UserFlags[UserFlags["HOUSE_BALANCE"] = 256] = "HOUSE_BALANCE";
    UserFlags[UserFlags["EARLY_SUPPORTER"] = 512] = "EARLY_SUPPORTER";
    UserFlags[UserFlags["TEAM_USER"] = 1024] = "TEAM_USER";
    UserFlags[UserFlags["SYSTEM"] = 4096] = "SYSTEM";
})(UserFlags || (UserFlags = {}));
export var NitroTypes;
(function (NitroTypes) {
    NitroTypes[NitroTypes["NITRO_CLASSIC"] = 1] = "NITRO_CLASSIC";
    NitroTypes[NitroTypes["NITRO"] = 2] = "NITRO";
})(NitroTypes || (NitroTypes = {}));
export var AuditLogs;
(function (AuditLogs) {
    AuditLogs[AuditLogs["GUILD_UPDATE"] = 1] = "GUILD_UPDATE";
    AuditLogs[AuditLogs["CHANNEL_CREATE"] = 10] = "CHANNEL_CREATE";
    AuditLogs[AuditLogs["CHANNEL_UPDATE"] = 11] = "CHANNEL_UPDATE";
    AuditLogs[AuditLogs["CHANNEL_DELETE"] = 12] = "CHANNEL_DELETE";
    AuditLogs[AuditLogs["CHANNEL_OVERWRITE_CREATE"] = 13] = "CHANNEL_OVERWRITE_CREATE";
    AuditLogs[AuditLogs["CHANNEL_OVERWRITE_UPDATE"] = 14] = "CHANNEL_OVERWRITE_UPDATE";
    AuditLogs[AuditLogs["CHANNEL_OVERWRITE_DELETE"] = 15] = "CHANNEL_OVERWRITE_DELETE";
    AuditLogs[AuditLogs["MEMBER_KICK"] = 20] = "MEMBER_KICK";
    AuditLogs[AuditLogs["MEMBER_PRUNE"] = 21] = "MEMBER_PRUNE";
    AuditLogs[AuditLogs["MEMBER_BAN_ADD"] = 22] = "MEMBER_BAN_ADD";
    AuditLogs[AuditLogs["MEMBER_BAN_REMOVE"] = 23] = "MEMBER_BAN_REMOVE";
    AuditLogs[AuditLogs["MEMBER_UPDATE"] = 24] = "MEMBER_UPDATE";
    AuditLogs[AuditLogs["MEMBER_ROLE_UPDATE"] = 25] = "MEMBER_ROLE_UPDATE";
    AuditLogs[AuditLogs["MEMBER_MOVE"] = 26] = "MEMBER_MOVE";
    AuditLogs[AuditLogs["MEMBER_DISCONNECT"] = 27] = "MEMBER_DISCONNECT";
    AuditLogs[AuditLogs["BOT_ADD"] = 28] = "BOT_ADD";
    AuditLogs[AuditLogs["ROLE_CREATE"] = 30] = "ROLE_CREATE";
    AuditLogs[AuditLogs["ROLE_UPDATE"] = 31] = "ROLE_UPDATE";
    AuditLogs[AuditLogs["ROLE_DELETE"] = 32] = "ROLE_DELETE";
    AuditLogs[AuditLogs["INVITE_CREATE"] = 40] = "INVITE_CREATE";
    AuditLogs[AuditLogs["INVITE_UPDATE"] = 41] = "INVITE_UPDATE";
    AuditLogs[AuditLogs["INVITE_DELETE"] = 42] = "INVITE_DELETE";
    AuditLogs[AuditLogs["WEBHOOK_CREATE"] = 50] = "WEBHOOK_CREATE";
    AuditLogs[AuditLogs["WEBHOOK_UPDATE"] = 51] = "WEBHOOK_UPDATE";
    AuditLogs[AuditLogs["WEBHOOK_DELETE"] = 52] = "WEBHOOK_DELETE";
    AuditLogs[AuditLogs["EMOJI_CREATE"] = 60] = "EMOJI_CREATE";
    AuditLogs[AuditLogs["EMOJI_UPDATE"] = 61] = "EMOJI_UPDATE";
    AuditLogs[AuditLogs["EMOJI_DELETE"] = 62] = "EMOJI_DELETE";
    AuditLogs[AuditLogs["MESSAGE_DELETE"] = 72] = "MESSAGE_DELETE";
    AuditLogs[AuditLogs["MESSAGE_BULK_DELETE"] = 73] = "MESSAGE_BULK_DELETE";
    AuditLogs[AuditLogs["MESSAGE_PIN"] = 74] = "MESSAGE_PIN";
    AuditLogs[AuditLogs["MESSAGE_UNPIN"] = 75] = "MESSAGE_UNPIN";
    AuditLogs[AuditLogs["INTEGRATION_CREATE"] = 80] = "INTEGRATION_CREATE";
    AuditLogs[AuditLogs["INTEGRATION_UPDATE"] = 81] = "INTEGRATION_UPDATE";
    AuditLogs[AuditLogs["INTEGRATION_DELETE"] = 82] = "INTEGRATION_DELETE";
})(AuditLogs || (AuditLogs = {}));
export var OverwriteType;
(function (OverwriteType) {
    OverwriteType[OverwriteType["ROLE"] = 0] = "ROLE";
    OverwriteType[OverwriteType["MEMBER"] = 1] = "MEMBER";
})(OverwriteType || (OverwriteType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJndWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE2VUEsTUFBTSxDQUFOLElBQVksU0FZWDtBQVpELFdBQVksU0FBUztJQUNuQix5Q0FBSSxDQUFBO0lBQ0osaUVBQWdCLENBQUE7SUFDaEIsK0RBQWUsQ0FBQTtJQUNmLG1FQUEwQixDQUFBO0lBQzFCLHFEQUFtQixDQUFBO0lBQ25CLDREQUFzQixDQUFBO0lBQ3RCLG1FQUF5QixDQUFBO0lBQ3pCLDZEQUFzQixDQUFBO0lBQ3RCLGlFQUF3QixDQUFBO0lBQ3hCLHNEQUFtQixDQUFBO0lBQ25CLGdEQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFaVyxTQUFTLEtBQVQsU0FBUyxRQVlwQjtBQUVELE1BQU0sQ0FBTixJQUFZLFVBR1g7QUFIRCxXQUFZLFVBQVU7SUFDcEIsNkRBQWlCLENBQUE7SUFDakIsNkNBQUssQ0FBQTtBQUNQLENBQUMsRUFIVyxVQUFVLEtBQVYsVUFBVSxRQUdyQjtBQTRERCxNQUFNLENBQU4sSUFBWSxTQW9DWDtBQXBDRCxXQUFZLFNBQVM7SUFDbkIseURBQWdCLENBQUE7SUFDaEIsOERBQW1CLENBQUE7SUFDbkIsOERBQWMsQ0FBQTtJQUNkLDhEQUFjLENBQUE7SUFDZCxrRkFBd0IsQ0FBQTtJQUN4QixrRkFBd0IsQ0FBQTtJQUN4QixrRkFBd0IsQ0FBQTtJQUN4Qix3REFBZ0IsQ0FBQTtJQUNoQiwwREFBWSxDQUFBO0lBQ1osOERBQWMsQ0FBQTtJQUNkLG9FQUFpQixDQUFBO0lBQ2pCLDREQUFhLENBQUE7SUFDYixzRUFBa0IsQ0FBQTtJQUNsQix3REFBVyxDQUFBO0lBQ1gsb0VBQWlCLENBQUE7SUFDakIsZ0RBQU8sQ0FBQTtJQUNQLHdEQUFnQixDQUFBO0lBQ2hCLHdEQUFXLENBQUE7SUFDWCx3REFBVyxDQUFBO0lBQ1gsNERBQWtCLENBQUE7SUFDbEIsNERBQWEsQ0FBQTtJQUNiLDREQUFhLENBQUE7SUFDYiw4REFBbUIsQ0FBQTtJQUNuQiw4REFBYyxDQUFBO0lBQ2QsOERBQWMsQ0FBQTtJQUNkLDBEQUFpQixDQUFBO0lBQ2pCLDBEQUFZLENBQUE7SUFDWiwwREFBWSxDQUFBO0lBQ1osOERBQW1CLENBQUE7SUFDbkIsd0VBQW1CLENBQUE7SUFDbkIsd0RBQVcsQ0FBQTtJQUNYLDREQUFhLENBQUE7SUFDYixzRUFBdUIsQ0FBQTtJQUN2QixzRUFBa0IsQ0FBQTtJQUNsQixzRUFBa0IsQ0FBQTtBQUNwQixDQUFDLEVBcENXLFNBQVMsS0FBVCxTQUFTLFFBb0NwQjtBQWFELE1BQU0sQ0FBTixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsaURBQUksQ0FBQTtJQUNKLHFEQUFNLENBQUE7QUFDUixDQUFDLEVBSFcsYUFBYSxLQUFiLGFBQWEsUUFHeEIifQ==