export function payload(size) {
  return Buffer.alloc(size, "a");
}

export function measure(label, start, end, count) {
  const seconds = Number(end - start) / 1e9;
  console.log(
    `${label.padEnd(18)} | ${count} msgs | ${seconds.toFixed(2)}s | ${(count / seconds).toFixed(0)} msg/s`,
  );
}

export function now() {
  return process.hrtime.bigint();
}

export function durationMs(start, end) {
  return Number(end - start) / 1e6;
}

export function result(client, messages, start, end, memoryMB) {
  const seconds = Number(end - start) / 1e9;
  return {
    Client: client,
    Messages: messages,
    "Time (s)": seconds.toFixed(2),
    "Msgs/sec": Math.round(messages / seconds),
    "Peak RSS (MB)": memoryMB,
  };
}
