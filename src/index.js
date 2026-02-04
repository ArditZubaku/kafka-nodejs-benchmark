import { runKafkaJS } from "./bench-kafkajs.js";
import { runPlatformatic } from "./bench-platformatic.js";
import { runRdkafka } from "./bench-rdkafka.js";

console.log("\nKafka Producer Benchmark\n");

const results = [];
results.push(await runKafkaJS());
results.push(await runPlatformatic());
results.push(await runRdkafka());

console.table(results);
