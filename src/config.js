export const BROKERS = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",")
  : ["localhost:9092"];

console.log({ BROKERS })
export const TOPIC = "bench-topic";
export const MESSAGE_COUNT = 200_000
export const MESSAGE_SIZE = 512 // bytes (very realistic)
export const BATCH_SIZE = 500   // common prod value
export const ACKS = 1           // leader ack