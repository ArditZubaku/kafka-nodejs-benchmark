import Kafka from "node-rdkafka"
import { BROKERS, TOPIC, MESSAGE_COUNT, MESSAGE_SIZE } from "./config.js"
import { payload, now, result } from "./util.js"

const BATCH_SIZE = 100

export async function runRdkafka() {
  const producer = new Kafka.Producer({
    "bootstrap.servers": BROKERS.join(","),
    "linger.ms": 0,
    "queue.buffering.max.messages": 1_000_000
  })

  await new Promise((res, rej) =>
    producer.connect({}, err => (err ? rej(err) : res()))
  )

  producer.setPollInterval(10)

  const value = payload(MESSAGE_SIZE)
  const batches = Math.ceil(MESSAGE_COUNT / BATCH_SIZE)

  const start = now()
  let produced = 0

  for (let i = 0; i < batches; i++) {
    for (let j = 0; j < BATCH_SIZE && produced < MESSAGE_COUNT; j++) {
      try {
        producer.produce(TOPIC, 0, value)
        produced++
      } catch (err) {
        if (err.code === Kafka.CODES.ERRORS.ERR__QUEUE_FULL) {
          await new Promise(r => setTimeout(r, 1))
          j--
        } else {
          throw err
        }
      }
    }
  }

  await new Promise(res => producer.flush(10000, res))
  producer.disconnect()

  const end = now()

  return result("node-rdkafka", MESSAGE_COUNT, start, end)
}