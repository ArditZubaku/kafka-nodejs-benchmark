import Kafka from "node-rdkafka";
import {
  BROKERS,
  TOPIC,
  MESSAGE_COUNT,
  MESSAGE_SIZE,
  BATCH_SIZE,
} from "./config.js";
import { payload, now, result } from "./util.js";
import { resetMemory, sampleMemory, getPeakMemoryMB } from "./memory.js";

export async function runRdkafka() {
  const producer = new Kafka.Producer({
    "bootstrap.servers": BROKERS.join(","),
    acks: 1,
    "linger.ms": 5,
    "batch.num.messages": BATCH_SIZE,
    "queue.buffering.max.messages": 1_000_000,
  });

  await new Promise((res, rej) =>
    producer.connect({}, (err) => (err ? rej(err) : res())),
  );

  producer.setPollInterval(10);

  const value = payload(MESSAGE_SIZE);
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE);

  resetMemory();
  const start = now();
  let produced = 0;

  for (let i = 0; i < batches; i++) {
    for (let j = 0; j < BATCH_SIZE && produced < MESSAGE_COUNT; j++) {
      try {
        producer.produce(TOPIC, null, value);
        sampleMemory();
        produced++;
      } catch (err) {
        if (err.code === Kafka.CODES.ERRORS.ERR__QUEUE_FULL) {
          await new Promise((r) => setTimeout(r, 1));
          j--;
        } else {
          throw err;
        }
      }
    }
  }

  await new Promise((res) => producer.flush(15_000, res));
  producer.disconnect();

  const end = now();

  return result("node-rdkafka", MESSAGE_COUNT, start, end, getPeakMemoryMB());
}
