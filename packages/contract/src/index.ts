export type RequestEvent = {
    id: string; // generated in the sdk, so a retried batch cannot double count
    route: string; // from routeTemplate
    method: string; // GET, POST
    statusCode: number;
    durationUs: number; // microseconds, same unit the server stores
    startedAt: number; // epoch ms
};
