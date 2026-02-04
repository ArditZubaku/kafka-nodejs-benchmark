export const BROKERS = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",")
  : ["localhost:9092"];

console.log({ BROKERS })
export const TOPIC = "bench-topic";
export const MESSAGE_COUNT = 200_000;
export const MESSAGE_SIZE = 512;
