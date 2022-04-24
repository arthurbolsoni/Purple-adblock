export function current(channel = null) {
  if (channel) {
    return global.channel.find((x) => x.name === channel);
  } else {
    return global.channel.find((x) => x.name === global.actualChannel);
  }
}
