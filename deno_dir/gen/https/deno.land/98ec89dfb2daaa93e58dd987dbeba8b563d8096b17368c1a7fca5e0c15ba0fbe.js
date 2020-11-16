import { delay } from "../../deps.ts";
import { baseEndpoints } from "../constants/discord.ts";
import { HttpResponseCode } from "../types/discord.ts";
import { Errors } from "../types/errors.ts";
import { authorization, eventHandlers } from "./client.ts";
const pathQueues = {};
const ratelimitedPaths = new Map();
let globallyRateLimited = false;
let queueInProcess = false;
async function processRateLimitedPaths() {
    const now = Date.now();
    ratelimitedPaths.forEach((value, key) => {
        if (value.resetTimestamp > now)
            return;
        ratelimitedPaths.delete(key);
        if (key === "global")
            globallyRateLimited = false;
    });
    await delay(1000);
    processRateLimitedPaths();
}
function addToQueue(request) {
    const route = request.url.substring(baseEndpoints.BASE_URL.length + 1);
    const parts = route.split("/");
    parts.shift();
    const [id] = parts;
    if (pathQueues[id]) {
        pathQueues[id].push(request);
    }
    else {
        pathQueues[id] = [request];
    }
}
async function cleanupQueues() {
    Object.entries(pathQueues).map(([key, value]) => {
        if (!value.length) {
            delete pathQueues[key];
        }
    });
}
async function processQueue() {
    if ((Object.keys(pathQueues).length) && !globallyRateLimited) {
        await Promise.allSettled(Object.values(pathQueues).map(async (pathQueue) => {
            const request = pathQueue.shift();
            if (!request)
                return;
            const rateLimitedURLResetIn = await checkRatelimits(request.url);
            if (request.bucketID) {
                const rateLimitResetIn = await checkRatelimits(request.bucketID);
                if (rateLimitResetIn) {
                    addToQueue(request);
                }
                else if (rateLimitedURLResetIn) {
                    addToQueue(request);
                }
                else {
                    const result = await request.callback();
                    if (result && result.rateLimited) {
                        addToQueue({ ...request, bucketID: result.bucketID || request.bucketID });
                    }
                }
            }
            else {
                if (rateLimitedURLResetIn) {
                    addToQueue(request);
                }
                else {
                    const result = await request.callback();
                    if (request && result && result.rateLimited) {
                        addToQueue({ ...request, bucketID: result.bucketID || request.bucketID });
                    }
                }
            }
        }));
    }
    if (Object.keys(pathQueues).length) {
        await delay(1000);
        processQueue();
        cleanupQueues();
    }
    else
        queueInProcess = false;
}
processRateLimitedPaths();
export const RequestManager = {
    get: async (url, body) => {
        return runMethod("get", url, body);
    },
    post: (url, body) => {
        return runMethod("post", url, body);
    },
    delete: (url, body) => {
        return runMethod("delete", url, body);
    },
    patch: (url, body) => {
        return runMethod("patch", url, body);
    },
    put: (url, body) => {
        return runMethod("put", url, body);
    },
};
function createRequestBody(body, method) {
    const headers = {
        Authorization: authorization,
        "User-Agent": `DiscordBot (https://github.com/skillz4killz/discordeno, 6.0.0)`,
    };
    if (method === "get")
        body = undefined;
    if (body?.reason) {
        headers["X-Audit-Log-Reason"] = encodeURIComponent(body.reason);
    }
    if (body?.file) {
        const form = new FormData();
        form.append("file", body.file.blob, body.file.name);
        form.append("payload_json", JSON.stringify({ ...body, file: undefined }));
        body.file = form;
    }
    else if (body && !["get", "delete"].includes(method)) {
        headers["Content-Type"] = "application/json";
    }
    return {
        headers,
        body: body?.file || JSON.stringify(body),
        method: method.toUpperCase(),
    };
}
async function checkRatelimits(url) {
    const ratelimited = ratelimitedPaths.get(url);
    const global = ratelimitedPaths.get("global");
    const now = Date.now();
    if (ratelimited && now < ratelimited.resetTimestamp) {
        return ratelimited.resetTimestamp - now;
    }
    if (global && now < global.resetTimestamp) {
        return global.resetTimestamp - now;
    }
    return false;
}
async function runMethod(method, url, body, retryCount = 0, bucketID) {
    eventHandlers.debug?.({
        type: "requestManager",
        data: { method, url, body, retryCount, bucketID },
    });
    const errorStack = new Error("Location In Your Files:");
    Error.captureStackTrace(errorStack);
    return new Promise((resolve, reject) => {
        const callback = async () => {
            try {
                const rateLimitResetIn = await checkRatelimits(url);
                if (rateLimitResetIn) {
                    return { rateLimited: rateLimitResetIn, beforeFetch: true, bucketID };
                }
                const query = method === "get" && body
                    ? Object.entries(body).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                        .join("&")
                    : "";
                const urlToUse = method === "get" && query ? `${url}?${query}` : url;
                eventHandlers.debug?.({
                    type: "requestManagerFetching",
                    data: { method, url, body, retryCount, bucketID },
                });
                const response = await fetch(urlToUse, createRequestBody(body, method));
                eventHandlers.debug?.({
                    type: "requestManagerFetched",
                    data: { method, url, body, retryCount, bucketID, response },
                });
                const bucketIDFromHeaders = processHeaders(url, response.headers);
                handleStatusCode(response, errorStack);
                if (response.status === 204)
                    return resolve();
                const json = await response.json();
                if (json.retry_after ||
                    json.message === "You are being rate limited.") {
                    if (retryCount > 10) {
                        eventHandlers.debug?.({
                            type: "error",
                            data: { method, url, body, retryCount, bucketID, errorStack },
                        });
                        throw new Error(Errors.RATE_LIMIT_RETRY_MAXED);
                    }
                    return {
                        rateLimited: json.retry_after,
                        beforeFetch: false,
                        bucketID: bucketIDFromHeaders,
                    };
                }
                eventHandlers.debug?.({
                    type: "requestManagerSuccess",
                    data: { method, url, body, retryCount, bucketID },
                });
                return resolve(json);
            }
            catch (error) {
                eventHandlers.debug?.({
                    type: "error",
                    data: { method, url, body, retryCount, bucketID, errorStack },
                });
                return reject(error);
            }
        };
        addToQueue({
            callback,
            bucketID,
            url,
        });
        if (!queueInProcess) {
            queueInProcess = true;
            processQueue();
        }
    });
}
async function logErrors(response, errorStack) {
    try {
        const error = await response.json();
        console.error(error);
        eventHandlers.debug?.({ type: "error", data: { errorStack, error } });
    }
    catch {
        eventHandlers.debug?.({
            type: "error",
            data: { errorStack },
        });
        console.error(response);
    }
}
function handleStatusCode(response, errorStack) {
    const status = response.status;
    if ((status >= 200 && status < 400) ||
        status === HttpResponseCode.TooManyRequests) {
        return true;
    }
    logErrors(response, errorStack);
    switch (status) {
        case HttpResponseCode.BadRequest:
        case HttpResponseCode.Unauthorized:
        case HttpResponseCode.Forbidden:
        case HttpResponseCode.NotFound:
        case HttpResponseCode.MethodNotAllowed:
            throw new Error(Errors.REQUEST_CLIENT_ERROR);
        case HttpResponseCode.GatewayUnavailable:
            throw new Error(Errors.REQUEST_SERVER_ERROR);
    }
    throw new Error(Errors.REQUEST_UNKNOWN_ERROR);
}
function processHeaders(url, headers) {
    let ratelimited = false;
    const remaining = headers.get("x-ratelimit-remaining");
    const resetTimestamp = headers.get("x-ratelimit-reset");
    const retryAfter = headers.get("retry-after");
    const global = headers.get("x-ratelimit-global");
    const bucketID = headers.get("x-ratelimit-bucket");
    if (remaining && remaining === "0") {
        ratelimited = true;
        ratelimitedPaths.set(url, {
            url,
            resetTimestamp: Number(resetTimestamp) * 1000,
            bucketID,
        });
        if (bucketID) {
            ratelimitedPaths.set(bucketID, {
                url,
                resetTimestamp: Number(resetTimestamp) * 1000,
                bucketID,
            });
        }
    }
    if (global) {
        const reset = Date.now() + Number(retryAfter);
        eventHandlers.debug?.({ type: "globallyRateLimited", data: { url, reset } });
        globallyRateLimited = true;
        ratelimited = true;
        ratelimitedPaths.set("global", {
            url: "global",
            resetTimestamp: reset,
            bucketID,
        });
        if (bucketID) {
            ratelimitedPaths.set(bucketID, {
                url: "global",
                resetTimestamp: reset,
                bucketID,
            });
        }
    }
    return ratelimited ? bucketID : undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXF1ZXN0TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFNUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFM0QsTUFBTSxVQUFVLEdBQXVDLEVBQUUsQ0FBQztBQUMxRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO0FBQzVELElBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0FBQ2hDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztBQW9CM0IsS0FBSyxVQUFVLHVCQUF1QjtJQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDdkIsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3RDLElBQUksS0FBSyxDQUFDLGNBQWMsR0FBRyxHQUFHO1lBQUUsT0FBTztRQUN2QyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxHQUFHLEtBQUssUUFBUTtZQUFFLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNwRCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLHVCQUF1QixFQUFFLENBQUM7QUFDNUIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLE9BQXNCO0lBQ3hDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMs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