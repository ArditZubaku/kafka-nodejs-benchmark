import { Producer, ProduceAcks } from "@platformatic/kafka";
import {
  BROKERS,
  TOPIC,
  MESSAGE_COUNT,
  MESSAGE_SIZE,
  BATCH_SIZE,
} from "./config.js";
import { payload, now, result } from "./util.js";
import { resetMemory, sampleMemory, getPeakMemoryMB } from "./memory.js";

export async function runPlatformatic() {
  const producer = new Producer({
    clientId: "benchmarks",
    bootstrapBrokers: BROKERS,
  });

  const value = payload(MESSAGE_SIZE); // Buffer
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE);

  resetMemory();
  const start = now();

  for (let i = 0; i < batches; i++) {
    const messages = [];

    for (let j = 0; j < BATCH_SIZE && i * BATCH_SIZE + j < MESSAGE_COUNT; j++) {
      messages.push({
        topic: TOPIC,
        value,
      });
    }

    await producer.send({
      messages,
      acks: ProduceAcks.LEADER,
    });
    sampleMemory();
  }

  const end = now();

  await producer.close();

  return result("Platformatic", MESSAGE_COUNT, start, end, getPeakMemoryMB());
}
