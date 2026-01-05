import { FastifyInstance } from "fastify";
import { TelemetryEvent } from "../../../../shared/types/events";
import { recordEvent, listEvents } from "../storage/db";
import { requireAuth } from "./auth";

export async function eventRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: TelemetryEvent }>("/events", async (req, reply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    const evt = req.body;
    if (!evt.origin || !evt.similarityBand) return reply.code(400).send({ error: "invalid event" });
    recordEvent(evt);
    return reply.code(202).send({ ok: true });
  });

  app.get("/events", async (_req, reply) => {
    return reply.send(listEvents());
  });
}
