export function sleep(timespan) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timespan)
  })
}
