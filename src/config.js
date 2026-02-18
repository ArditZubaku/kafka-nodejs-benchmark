export const BROKERS = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",")
  : ["localhost:9092"];

export const TOPIC = "bench-topic";
export const MESSAGE_COUNT = 200_000;
export const MESSAGE_SIZE = 512; // bytes
export const BATCH_SIZE = 500;   // common prod value
export const ACKS = 1;           // leader ack
export const ITERATIONS = parseInt(process.env.ITERATIONS ?? "5", 10);