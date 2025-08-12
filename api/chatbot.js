export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const BASE_URL = "https://liga-chatbot-service-532186976426.us-central1.run.app";

  try {
    // Expect full path to be passed as ?path=/apps/... or /run
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: "Missing 'path' query parameter" });
    }

    // Forward request to the Liga API
    const targetUrl = `${BASE_URL}${path}`;
    const ligaResponse = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" && req.method !== "OPTIONS" ? JSON.stringify(req.body) : undefined
    });

    const text = await ligaResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text; // Not JSON
    }

    res.status(ligaResponse.status).json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
