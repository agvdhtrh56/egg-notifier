const express = require("express");
const app = express();
app.use(express.json());

const webhookRoutes = require("./routes/webhook");
app.use("/api/webhook", webhookRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
