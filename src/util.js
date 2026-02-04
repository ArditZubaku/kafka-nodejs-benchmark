export function payload(size) {
  return Buffer.alloc(size, "a");
}

export function measure(label, start, end, count) {
  const seconds = Number(end - start) / 1e9;
  console.log(
    `${label.padEnd(18)} | ${count} msgs | ${seconds.toFixed(2)}s | ${(count / seconds).toFixed(0)} msg/s`
  );
}

export function now() {
  return process.hrtime.bigint()
}

export function durationMs(start, end) {
  return Number(end - start) / 1e6
}

export function result(name, messages, start, end) {
  const ms = durationMs(start, end)
  return {
    name,
    messages,
    seconds: (ms / 1000).toFixed(2),
    msgPerSec: Math.round(messages / (ms / 1000))
  }
}