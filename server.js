import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Load API key from Railway Environment Variable
const API_KEY = process.env.STABILITY_API_KEY;

app.get("/", (req, res) => {
  res.send("NeonGen AI Backend Running 🚀");
});

/**
 * POST /generate
 * Body:
 *  prompt: string
 *  style: string
 *  resolution: "1024x1024" | "512x512" | ...
 *  count: 1–4 images
 */
app.post("/generate", async (req, res) => {
  try {
    const { prompt, style, resolution, count } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: "Backend missing API key" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Combine prompt + style
    const finalPrompt = `${prompt}. Style: ${style}. Ultra-detailed, high quality.`;

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sdxl",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          output_format: "png",
          mode: "text-to-image",
          size: resolution,
          samples: count, // number of images
        }),
      }
    );

    const data = await response.json();

    if (!data || !data.images) {
      return res.status(500).json({
        error: "Image generation failed",
        details: data,
      });
    }

    // Return ONLY image URLs/base64
    return res.json({
      success: true,
      images: data.images, // array of base64 PNGs
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Backend server error" });
  }
});

// Railway uses PORT env automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 NeonGen Backend Running on port ${PORT}`)
);
