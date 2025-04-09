import { Hono } from "hono";
import { startBotInProd } from ".";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  if (c.env.WEBHOOK_DOMAIN === undefined || c.env.WEBHOOK_DOMAIN === "") {
    throw new TypeError("NODE_ENV must be specified");
  }

  startBotInProd(c.env);

  // const PORT = Number(process.env.PORT) || 8080;

  return c.text("mekmek");
});

export default app;
