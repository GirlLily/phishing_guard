import { FastifyInstance } from "fastify";
import { addBaselines } from "../storage/db";
import { VisualBaseline } from "../types/policy";
import { requireAuth } from "./auth";

export async function baselineRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { companyId: string }; Body: { baselines: Omit<VisualBaseline, "createdAt">[] } }>("/baselines/:companyId", async (req, reply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    const { baselines } = req.body;
    if (!Array.isArray(baselines) || baselines.length === 0) {
      return reply.code(400).send({ error: "baselines required" });
    }
    addBaselines(req.params.companyId, baselines.map((b) => ({ ...b, createdAt: new Date().toISOString() })));
    return reply.code(201).send({ ok: true });
  });
}
