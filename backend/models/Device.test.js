// Checks the Device schema rules without needing a database:
// validate() runs the same validators Mongoose runs before saving.
import { test, expect } from "bun:test";
import { Device } from "./Device.js";

const errorsFor = (fields) =>
  new Device(fields).validate().then(() => [], (err) => Object.keys(err.errors));

test("accepts a valid device", async () => {
  expect(await errorsFor({ name: "sensor-01", type: "ESP32", currentFirmwareVersion: "1.2.0" })).toEqual([]);
});

test("rejects missing, short, or badly formatted fields", async () => {
  expect(await errorsFor({})).toEqual(expect.arrayContaining(["name", "type"]));
  expect(await errorsFor({ name: "x", type: "ESP32" })).toEqual(["name"]);
  expect(await errorsFor({ name: "bad/name", type: "ESP32" })).toEqual(["name"]);
  expect(await errorsFor({ name: "sensor-01", type: "ESP32", currentFirmwareVersion: "v1" })).toEqual(["currentFirmwareVersion"]);
  expect(await errorsFor({ name: "sensor-01", type: "ESP32", status: "broken" })).toEqual(["status"]);
});
