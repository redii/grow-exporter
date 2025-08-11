# 🌱 Grow Exporter

This repo contains the exporter, which receives sensor data from [grow-sensors](https://github.com/redii/grow-sensors) and publish them for a prometheus instance.

## Project Structure

```
grow-exporter
├── src
│   └── app.ts           # Express server with /push and /metrics endpoints
├── package.json         # npm configuration file
├── tsconfig.json        # TypeScript configuration file
└── README.md            # Project documentation
```

## Usage

The exporter can be configured using the following environment variables:

| Variable  | Required                    | Default | Description                                                |
| --------- | --------------------------- | ------- | ---------------------------------------------------------- |
| `API_KEY` | ❌ (but highly recommended) | -       | The API key used to secure the exporters `/push` endpoint. |
| `PORT`    | ❌                          | `3000`  | The port used to run the webserver.                        |

You can start the script using `npm start`.

### Sensors

The exporter currently provides the following values:

| Data Type   | Prometheus Key               | Unit    | Description                      |
| ----------- | ---------------------------- | ------- | -------------------------------- |
| Temperature | `grow_temperature_celsius`   | Celsius | Temperature in Celsius           |
| Humidity    | `grow_humidity_percent`      | %       | Humidity in Percent              |
| Moisture    | `grow_moisture_percent`      | %       | Soil Moisture in Percent         |
| Illuminance | `grow_illuminance_percent`   | Lux     | Illuminance in Lux               |
| Timestamp   | `grow_last_update_timestamp` | -       | Last timestamp data was received |

## License

This project is licensed under the MIT License.
