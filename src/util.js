export function payload(size) {
  return Buffer.alloc(size, "a");
}

export function now() {
  return process.hrtime.bigint();
}

export function result(client, messages, start, end, memoryMB) {
  const seconds = Number(end - start) / 1e9;
  return {
    client,
    messages,
    seconds: parseFloat(seconds.toFixed(3)),
    msgsPerSec: Math.round(messages / seconds),
    peakRssMB: memoryMB,
  };
}

export function stats(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);
  return {
    mean: Math.round(mean),
    stddev: Math.round(stddev),
    min: Math.min(...values),
    max: Math.max(...values),
    cv: parseFloat(((stddev / mean) * 100).toFixed(1)),
  };
}

export function printResults(collected, iterations) {
  console.log(`\n${"─".repeat(72)}`);
  console.log(`Summary — ${iterations} iterations per client\n`);

  const summary = [];
  for (const [client, runs] of Object.entries(collected)) {
    const t = stats(runs.map((r) => r.msgsPerSec));
    const m = stats(runs.map((r) => r.peakRssMB));
    summary.push({
      Client: client,
      "Mean (msg/s)": t.mean.toLocaleString(),
      "± StdDev": t.stddev.toLocaleString(),
      "CV%": `${t.cv}%`,
      Min: t.min.toLocaleString(),
      Max: t.max.toLocaleString(),
      "Peak RSS (MB)": m.mean,
    });
  }
  console.table(summary);

  console.log("\nRaw iterations:\n");
  const raw = [];
  for (const [client, runs] of Object.entries(collected)) {
    runs.forEach((r, i) => {
      raw.push({
        Client: client,
        "#": i + 1,
        "msg/s": r.msgsPerSec.toLocaleString(),
        "Time (s)": r.seconds.toFixed(2),
        "Peak RSS (MB)": r.peakRssMB,
      });
    });
  }
  console.table(raw);
}
