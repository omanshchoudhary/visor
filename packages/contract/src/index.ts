export type RequestEvent = {
    route: string; // from routeTemplate
    method: string; // GET, POST
    statusCode: number;
    durationMs: number;
    startedAt: number;
};
