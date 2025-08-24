// server.ts (Render container entrypoint)
import express from "express";

const app = express();
app.use(express.json());

// Example heavy endpoint
app.get("/classify", async (req, res) => {
  // simulate heavy ML classification
  await new Promise((r) => setTimeout(r, 500)); // fake work
  res.json({
    success: true,
    result: "classified",
    ts: new Date().toISOString(),
  });
});

// Example echo endpoint to test proxy
app.post("/echo", (req, res) => {
  res.json({
    received: req.body,
    ts: new Date().toISOString(),
  });
});

// Root route
app.get("/", (_, res) => res.json({ status: "ok", service: "heavy" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Heavy service running on port ${PORT}`);
});
