import { FastifyInstance } from "fastify";
import { buildSignedPolicy } from "../storage/db";

export async function policyRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { companyId: string } }>("/policy/:companyId", async (req, reply) => {
    const signed = buildSignedPolicy(req.params.companyId);
    if (!signed) return reply.code(404).send({ error: "not found" });
    return reply.send(signed);
  });
}
