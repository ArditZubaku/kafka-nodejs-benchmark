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
    "request.required.acks": 1,
    "linger.ms": 0,                              // no artificial delay
    "batch.num.messages": BATCH_SIZE,            // match batch size of other clients
    "queue.buffering.max.messages": BATCH_SIZE * 2, // just enough for one batch
  });

  await new Promise((res, rej) =>
    producer.connect({}, (err) => (err ? rej(err) : res())),
  );

  producer.setPollInterval(10);

  const value = payload(MESSAGE_SIZE);
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE);

  resetMemory();
  const start = now();

  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(BATCH_SIZE, MESSAGE_COUNT - i * BATCH_SIZE);

    // Enqueue the full batch synchronously, then flush — same semantic as
    // KafkaJS/Platformatic: send batch, wait for broker ack, repeat.
    for (let j = 0; j < batchSize; j++) {
      producer.produce(TOPIC, null, value);
    }

    await new Promise((res, rej) =>
      producer.flush(15_000, (err) => (err ? rej(err) : res())),
    );
    sampleMemory();
  }

  const end = now();
  producer.disconnect();

  return result("node-rdkafka", MESSAGE_COUNT, start, end, getPeakMemoryMB());
}
