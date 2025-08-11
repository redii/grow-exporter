import express, { Request, Response } from "express";
import { Gauge, Registry } from "prom-client";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

const register = new Registry();

// Middleware
app.use(express.json());

// Define metrics
const temperatureGauge = new Gauge({
  name: "grow_temperature_celsius",
  help: "Temperature in Celsius",
});
const humidityGauge = new Gauge({
  name: "grow_humidity_percent",
  help: "Humidity in Percent",
});
const moistureGauge = new Gauge({
  name: "grow_moisture_percent",
  help: "Soil Moisture in Percent",
});
const illuminanceGauge = new Gauge({
  name: "grow_illuminance_percent",
  help: "Illuminance in Lux",
});
const lastUpdateGauge = new Gauge({
  name: "grow_last_update_timestamp",
  help: "Last timestamp data was received",
});

// Register metrics
register.registerMetric(temperatureGauge);
register.registerMetric(humidityGauge);
register.registerMetric(moistureGauge);
register.registerMetric(illuminanceGauge);
register.registerMetric(lastUpdateGauge);

// POST endpoint to receive data
app.post("/push", (req: Request, res: Response) => {
  if (apiKey && req.headers["x-api-key"] !== apiKey) {
    return res.status(401).json({
      success: false,
      status: "Incorrect API key",
    });
  }

  const { temperature, humidity, moisture, illuminance } = req.body;

  if (temperature) {
    if (typeof temperature !== "number")
      return res.status(400).json({
        success: false,
        status: "Temperature must be a number (celsius)",
      });
    temperatureGauge.set(temperature);
  }

  if (humidity) {
    if (typeof humidity !== "number")
      return res.status(400).json({
        success: false,
        status: "Humidity must be a number (percent)",
      });
    humidityGauge.set(humidity);
  }

  if (moisture) {
    if (typeof moisture !== "number")
      return res.status(400).json({
        success: false,
        status: "Moisture must be a number (percent)",
      });
    moistureGauge.set(moisture);
  }

  if (illuminance) {
    if (typeof illuminance !== "number")
      return res.status(400).json({
        success: false,
        status: "Illuminance must be a number (lux)",
      });
    illuminanceGauge.set(illuminance);
  }

  temperatureGauge.set(temperature);
  humidityGauge.set(humidity);
  moistureGauge.set(moisture);
  illuminanceGauge.set(illuminance);
  lastUpdateGauge.set(Date.now() / 1000); // timestamp in seconds

  console.info(new Date(), "values saved");
  return res.json({ success: true, status: "Values have been saved" });
});

// Prometheus metrics endpoint
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  console.info(new Date(), "metrics exported");
  res.end(await register.metrics());
});

// Start webserver
app.listen(port, () => {
  console.log(`Exporter is listening on port ${port}`);
});
