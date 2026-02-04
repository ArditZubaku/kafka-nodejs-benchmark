import { Producer, ProduceAcks } from "@platformatic/kafka"
import { BROKERS, TOPIC, MESSAGE_COUNT, MESSAGE_SIZE } from "./config.js"
import { payload, now, result } from "./util.js"

const BATCH_SIZE = 100

export async function runPlatformatic() {
  const producer = new Producer({
    clientId: "benchmarks",
    bootstrapBrokers: BROKERS
  })

  const value = payload(MESSAGE_SIZE)
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE)

  const start = now()

  for (let i = 0; i < batches; i++) {
    const messages = []
    for (let j = 0; j < BATCH_SIZE && i * BATCH_SIZE + j < MESSAGE_COUNT; j++) {
      messages.push({
        topic: TOPIC,
        partition: 0,
        value
      })
    }

    await producer.send({
      messages,
      acks: ProduceAcks.NO_RESPONSE
    })
  }

  const end = now()

  await producer.close()

  return result("Platformatic", MESSAGE_COUNT, start, end)
}