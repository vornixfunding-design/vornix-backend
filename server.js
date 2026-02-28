import dotenv from "dotenv";
import app from "./app.js";
import authRoutes from "./src/routes/authRoutes.js";
import { seedPlans } from "./src/utils/seedPlans.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use("/", authRoutes);

const startServer = async () => {
  await seedPlans();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
