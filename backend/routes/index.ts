// Optional: If you want to aggregate all routes for easy import
import { Express } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";

export default (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
};