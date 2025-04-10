import { Hono } from "hono";
import { configureBot } from ".";

const app = new Hono<{ Bindings: Env }>();

app
  .get("/mekmek", (c) => c.text("mekmek2"))
  .post("/", async (c) => {
    const bot = configureBot(c.env);
    await bot.handleUpdate(await c.req.json());
    return c.text("very nice. great success");
  });

export default app;
