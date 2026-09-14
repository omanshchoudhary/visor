import type { Request, Response } from "express";
import { prisma } from "../db.ts";

export async function healthHandler(_req: Request, res: Response): Promise<void> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
        console.error("Healthcheck failed - Database query error:", error);
        res.status(503).json({ status: "error", database: "disconnected" });
    }
}
