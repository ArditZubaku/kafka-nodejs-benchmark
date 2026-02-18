import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ITERATIONS, MESSAGE_COUNT, BATCH_SIZE, ACKS } from "./config.js";
import { printResults } from "./util.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNNER = join(__dirname, "runner.js");
const CLIENTS = ["kafkajs", "platformatic", "rdkafka"];

function runClient(client) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RUNNER, client], {
      // stdout piped so we capture the JSON result; stderr inherited so
      // library logs and errors are visible in the terminal.
      stdio: ["ignore", "pipe", "inherit"],
    });

    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`"${client}" exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(output.trim()));
      } catch {
        reject(new Error(`Failed to parse output from "${client}": ${output}`));
      }
    });
  });
}

console.log(`\nKafka Producer Benchmark`);
console.log(
  `Iterations: ${ITERATIONS} | Messages: ${MESSAGE_COUNT.toLocaleString()} | Batch: ${BATCH_SIZE} | Acks: ${ACKS}\n`,
);

// One entry per client, holding all iteration results.
const collected = Object.fromEntries(CLIENTS.map((c) => [c, []]));

// Interleave iterations across clients so any system-level drift (thermal
// throttling, GC pressure, network jitter) is distributed evenly rather than
// consistently favouring clients that run later.
for (let i = 0; i < ITERATIONS; i++) {
  for (const client of CLIENTS) {
    process.stdout.write(`  [${i + 1}/${ITERATIONS}] ${client.padEnd(14)}`);
    const r = await runClient(client);
    collected[client].push(r);
    process.stdout.write(
      `${r.msgsPerSec.toLocaleString().padStart(10)} msg/s   ${r.peakRssMB} MB\n`,
    );
  }
}

printResults(collected, ITERATIONS);
