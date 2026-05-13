import "dotenv/config";
import cors from "cors";
import express from "express";
import { alertRoutes } from "./routes/alertRoutes.js";
import { fxRoutes } from "./routes/fxRoutes.js";
import { startAlertScheduler } from "./services/alertScheduler.js";

const app = express();
const port = Number(process.env.PORT ?? 7001);

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "currency-tracker-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/fx", fxRoutes);
app.use("/alerts", alertRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Currency Tracker API listening on http://0.0.0.0:${port}`);
});

startAlertScheduler();
