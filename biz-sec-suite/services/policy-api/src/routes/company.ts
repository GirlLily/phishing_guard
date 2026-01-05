import { FastifyInstance } from "fastify";
import { Enforcement, Thresholds } from "../types/policy";
import { createCompany, updateCompany } from "../storage/db";
import { requireAuth } from "./auth";

export async function companyRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { companyId: string; authOriginsAllowlist?: string[]; ssoStartAllowlist?: string[] } }>("/companies", async (req, reply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    const { companyId, authOriginsAllowlist, ssoStartAllowlist } = req.body;
    createCompany(companyId, { authOriginsAllowlist: authOriginsAllowlist ?? [], ssoStartAllowlist });
    return reply.code(201).send({ ok: true });
  });

  app.put<{ Params: { companyId: string }; Body: { authOriginsAllowlist?: string[]; ssoStartAllowlist?: string[]; thresholds?: Thresholds; enforcement?: Enforcement } }>("/companies/:companyId", async (req, reply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    const updated = updateCompany(req.params.companyId, req.body);
    if (!updated) return reply.code(404).send({ error: "not found" });
    return reply.send({ ok: true });
  });
}
