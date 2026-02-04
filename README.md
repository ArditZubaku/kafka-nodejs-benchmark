# Kafka Node.js Producer Benchmark

This project benchmarks **Kafka producer throughput and memory usage** across three major Node.js Kafka clients under **realistic, production-like conditions**.

The goal is **not** to optimize for artificial benchmark wins, but to understand **real trade-offs** in performance, memory, and operational complexity.

---

## Clients Compared

- **KafkaJS** — pure JavaScript Kafka client
- **@platformatic/kafka** — hybrid JS + native protocol implementation
- **node-rdkafka** — native bindings to `librdkafka`

All clients are tested against the **same Kafka cluster**, using **the same semantics**.

---

## What Is Measured

For each client we measure:

- Total messages produced
- Total execution time
- Messages per second
- **Peak RSS memory usage** (resident set size)

Memory usage includes:
- JS heap
- native memory
- internal buffering
- C++ addons

---

## Test Conditions (Fairness Matters)

All benchmarks run with **identical semantics**:

- `acks = 1` (leader acknowledgment)
- No `acks=0` shortcuts
- No pinned versions
- No artificial delays
- No cheating configurations
- Same topic
- Same batching strategy
- Same Node.js runtime (Node 25)
- Same Docker environment

**Compression is disabled** for all clients to avoid native build discrepancies and ensure fairness.

---

## Kafka Topic & Partitioning

The benchmark topic is configured as follows:

- Topic name: `bench-topic`
- **Partitions: 6**
- Replication factor: 3
- `min.insync.replicas = 1`

Messages are produced **without keys and without explicit partition assignment**.

This means:
- KafkaJS uses its **default round-robin partitioner**
- Messages are evenly distributed across **all 6 partitions**
- The benchmark measures **parallel producer throughput**, not single-partition limits

This setup reflects a common real-world Kafka topic used for high-throughput ingestion.

---

## Kafka Cluster Setup

- Kafka running in **KRaft mode**
- 3 brokers
- Docker Compose orchestration
- Init container ensures:
  - Kafka protocol readiness
  - Topic creation before benchmarks start

---

## How Memory Is Measured

- Memory is sampled during the hot send loop
- **Peak RSS** is tracked
- No log spam
- One final summary table is printed

RSS is used instead of JS heap size because:
- `node-rdkafka` uses native memory
- RSS reflects real OS memory pressure

---

## Benchmark Results

Each run produces **200,000 messages**.

### First Run (Cold Start)

| Client | Messages | Time (s) | Msgs/sec | Peak RSS |
|------|----------|----------|----------|----------|
| KafkaJS | 200000 | 1.77 | 113,260 | 133 MB |
| Platformatic | 200000 | 1.08 | 185,684 | 139 MB |
| node-rdkafka | 200000 | 0.90 | 222,584 | 288 MB |

---

### Fifth Run (Warm State)

| Client | Messages | Time (s) | Msgs/sec | Peak RSS |
|------|----------|----------|----------|----------|
| KafkaJS | 200000 | 1.25 | 159,816 | 146 MB |
| Platformatic | 200000 | 0.66 | 301,851 | 238 MB |
| node-rdkafka | 200000 | 0.71 | 281,594 | 392 MB |

---

## Interpretation

### Throughput

- **node-rdkafka** delivers the highest throughput during cold starts due to its native implementation.
- **@platformatic/kafka** benefits strongly from V8 JIT warm-up and can surpass native throughput in warm steady-state runs.
- **KafkaJS** is consistently slower due to JS-level batching, retries, and promise orchestration.

### Memory Usage

- KafkaJS uses the least memory overall.
- Platformatic remains well under the 512 MB budget while achieving high throughput.
- node-rdkafka trades increased memory usage for native-level buffering and throughput.

### Warm-up Effects

Repeated runs benefit from:
- V8 JIT compilation and optimization
- Kafka metadata caching
- Connection reuse
- Stabilized batching behavior

These effects disproportionately benefit Platformatic due to its hybrid design.

---

## Practical Takeaways

- **Choose node-rdkafka** if maximum throughput is critical and memory is carefully managed
- **Choose Platformatic** for strong performance with safer ergonomics
- **Choose KafkaJS** for portability, simplicity, and lower memory usage

There is no universally “best” client — only the best fit for your constraints.

---

## Running the Benchmark

```bash
docker compose up --build
```

The benchmark:
- runs once
- prints a single summary table
- exits cleanly
