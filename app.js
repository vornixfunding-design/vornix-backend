import express from "express";
import cors from "cors";
import routes from "./src/routes/index.js";
import requestLogger from "./src/middleware/requestLogger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
