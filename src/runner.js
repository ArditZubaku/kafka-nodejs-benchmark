// Single-client, single-iteration runner.
// Spawned as a child process by index.js for process isolation.
// Usage: node src/runner.js <kafkajs|platformatic|rdkafka>
// Writes one JSON line to stdout with the benchmark result.

import { runKafkaJS } from "./bench-kafkajs.js";
import { runPlatformatic } from "./bench-platformatic.js";
import { runRdkafka } from "./bench-rdkafka.js";

const client = process.argv[2];

const runners = {
  kafkajs: runKafkaJS,
  platformatic: runPlatformatic,
  rdkafka: runRdkafka,
};

const run = runners[client];
if (!run) {
  process.stderr.write(
    `Unknown client: "${client}". Valid: ${Object.keys(runners).join(", ")}\n`,
  );
  process.exit(1);
}

const r = await run();
process.stdout.write(JSON.stringify(r) + "\n");
