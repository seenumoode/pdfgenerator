import puppeteer from "puppeteer";
import { z } from "zod";

// Define the schema for JSON validation
const PayloadSchema = z
  .object({
    url: z.string().url("Invalid URL format"),
  })
  .strict();

// API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const result = PayloadSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        if (issue.code === "unrecognized_keys") {
          return `Unexpected property: ${issue.keys.join(", ")}`;
        }
        return issue.message;
      });
      return res.status(400).json({ error: errors.join("; ") });
    }

    const { url } = result.data;

    // Connect to Browserless
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });

    try {
      const page = await browser.newPage();

      // Set up image load detection
      const imageLoadPromises = [];
      await page.exposeFunction("onImageLoad", () => {
        // No-op: Puppeteer requires exposed functions to return serializable values
      });

      // Intercept DOM image load events
      await page.evaluateOnNewDocument(() => {
        document.querySelectorAll("img").forEach((img) => {
          if (img.complete) {
            window.onImageLoad();
          } else {
            img.addEventListener("load", () => window.onImageLoad());
            img.addEventListener("error", () => window.onImageLoad()); // Handle broken images
          }
        });
      });

      // Navigate to the URL
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Wait for images to load
      const images = await page.$$("img");
      if (images.length > 0) {
        await page.evaluate(() => {
          const promises = [];
          document.querySelectorAll("img").forEach((img) => {
            if (!img.complete) {
              promises.push(
                new Promise((resolve) => {
                  img.addEventListener("load", resolve);
                  img.addEventListener("error", resolve);
                })
              );
            }
          });
          return Promise.all(promises);
        });
      }

      // Set response headers for streaming PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=output.pdf");

      // Generate PDF as a Buffer and stream it
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      // Write the buffer to the response
      res.write(pdfBuffer);
      res.end();
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
