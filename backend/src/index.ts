import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";
import { ingredientRoutes } from "./routes/ingredients";
import { recipeRoutes } from "./routes/recipes";
import { expenseRoutes } from "./routes/expenses";
import { saleRoutes } from "./routes/sales";
import { reportRoutes } from "./routes/reports";
import { hppRoutes } from "./routes/hpp";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? true,
  credentials: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
});

app.get("/health", async () => ({ status: "ok", ts: Date.now() }));

app.register(authRoutes);
app.register(ingredientRoutes);
app.register(recipeRoutes);
app.register(expenseRoutes);
app.register(saleRoutes);
app.register(reportRoutes);
app.register(hppRoutes);

const port = Number(process.env.PORT ?? 3000);

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
