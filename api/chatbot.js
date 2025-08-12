export default async function handler(req, res) {
  // Allow CORS for Webflow
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight request
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path, ...bodyData } = req.body;

    if (!path) {
      return res.status(400).json({ error: "Missing 'path' in request body" });
    }

    // Build the target URL
    const targetUrl = `https://liga-chatbot-service-532186976426.us-central1.run.app/${path}`;

    // Forward the request to Cloud Run
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Error proxying chatbot request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
