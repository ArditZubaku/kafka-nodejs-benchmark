import { Kafka } from "kafkajs"
import { BROKERS, TOPIC, MESSAGE_COUNT, MESSAGE_SIZE } from "./config.js"
import { payload } from "./util.js"
import { now, result } from "./util.js"

const BATCH_SIZE = 100

export async function runKafkaJS() {
  const kafka = new Kafka({
    clientId: "benchmarks",
    brokers: BROKERS,
    logLevel: 0 // silence KafkaJS
  })

  const producer = kafka.producer({ maxInFlightRequests: BATCH_SIZE })
  await producer.connect()

  const value = payload(MESSAGE_SIZE)
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE)

  const start = now()

  for (let i = 0; i < batches; i++) {
    const messages = []
    for (let j = 0; j < BATCH_SIZE && i * BATCH_SIZE + j < MESSAGE_COUNT; j++) {
      messages.push({ partition: 0, value })
    }

    await producer.send({
      topic: TOPIC,
      messages,
      acks: 0
    })
  }

  const end = now()

  await producer.disconnect()

  return result("KafkaJS", MESSAGE_COUNT, start, end)
}