let peakRss = 0

export function sampleMemory() {
  const { rss } = process.memoryUsage()
  if (rss > peakRss) peakRss = rss
}

export function getPeakMemoryMB() {
  return Math.round(peakRss / 1024 / 1024)
}

export function resetMemory() {
  peakRss = 0
}