import express, { Request, Response } from 'express';
import { Gauge, Registry } from 'prom-client';

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

// Middleware
app.use(express.json());

// Define metrics
const metrics = [
  {
    key: 'temperature',
    name: 'grow_temperature_celsius',
    gauge: new Gauge({
      name: 'grow_temperature_celsius',
      help: 'Temperature in Celsius',
    }),
  },
  {
    key: 'humidity',
    name: 'grow_humidity_percent',
    gauge: new Gauge({
      name: 'grow_humidity_percent',
      help: 'Humidity in Percent',
    }),
  },
  {
    key: 'moisture',
    name: 'grow_moisture_percent',
    gauge: new Gauge({
      name: 'grow_moisture_percent',
      help: 'Soil Moisture in Percent',
    }),
  },
  {
    key: 'illuminance',
    name: 'grow_illuminance_lux',
    gauge: new Gauge({
      name: 'grow_illuminance_lux',
      help: 'Illuminance in Lux',
    }),
  },
];

// Register metrics
const register = new Registry();
const lastUpdateGauge = new Gauge({
  name: 'grow_last_update_timestamp',
  help: 'Last timestamp data was received',
});
register.registerMetric(lastUpdateGauge);

// POST endpoint to receive data
app.post('/push', (req: Request, res: Response) => {
  try {
    if (apiKey && req.headers['x-api-key'] !== apiKey) {
      return res.status(401).json({
        success: false,
        status: 'Incorrect API key',
      });
    }

    lastUpdateGauge.set(Date.now() / 1000); // timestamp in seconds

    for (const metric of metrics) {
      const value = req.body[metric.key];
      if (value === undefined) {
        register.removeSingleMetric(metric.name);
      } else {
        register.registerMetric(metric.gauge);
        metric.gauge.set(value);
      }
    }

    console.info(new Date(), 'values saved');
    return res.json({ success: true, status: 'Values have been saved' });
  } catch (err) {
    console.error(new Date(), '/push\n', err);
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    console.info(new Date(), 'metrics exported');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error(new Date(), '/metrics\n', err);
  }
});

// Start webserver
app.listen(port, () => {
  console.log(`Exporter is listening on port ${port}`);
});
