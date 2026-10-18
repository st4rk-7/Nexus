// Checks the Firmware version rule without a database.
import { test, expect } from "bun:test";
import { Firmware } from "./Firmware.js";

const errorsFor = (fields) =>
  new Firmware({ filePath: "uploads/x.bin", ...fields }).validate().then(() => [], (err) => Object.keys(err.errors));

test("firmware version must be major.minor.patch", async () => {
  expect(await errorsFor({ version: "2.5.0" })).toEqual([]);
  expect(await errorsFor({ version: "banana" })).toEqual(["version"]);
  expect(await errorsFor({ version: "v2.5" })).toEqual(["version"]);
  expect(await errorsFor({})).toEqual(["version"]);
});
