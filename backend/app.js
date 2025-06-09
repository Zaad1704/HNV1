import adminRoutes from "./routes/adminRoutes";
import orgRoutes from "./routes/orgRoutes";
// ...other imports...

app.use("/api/admin", adminRoutes);
app.use("/api/org", orgRoutes);
// ...other routes...