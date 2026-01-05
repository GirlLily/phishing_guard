import { FastifyReply, FastifyRequest } from "fastify";

const TOKEN = process.env.API_AUTH_TOKEN;

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!TOKEN) return; // auth disabled
  const header = req.headers["authorization"];
  if (!header || header !== `Bearer ${TOKEN}`) {
    reply.code(401).send({ error: "unauthorized" });
  }
}
