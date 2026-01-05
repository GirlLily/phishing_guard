import Fastify from "fastify";
import { policyRoutes } from "./routes/policy";
import { companyRoutes } from "./routes/company";
import { baselineRoutes } from "./routes/baselines";
import { eventRoutes } from "./routes/events";
import { load } from "./storage/db";

const app = Fastify({ logger: true });

app.register(policyRoutes);
app.register(companyRoutes);
app.register(baselineRoutes);
app.register(eventRoutes);

const port = Number(process.env.PORT || 3000);

load()
  .catch((err) => app.log.warn({ err }, "failed to load persisted state"))
  .finally(() => {
    app.listen({ port, host: "0.0.0.0" })
      .then(() => app.log.info(`policy-api listening on ${port}`))
      .catch((err) => {
        app.log.error(err, "failed to start");
        process.exit(1);
      });
  });
