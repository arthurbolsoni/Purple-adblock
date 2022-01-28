export function current() {
    return global.channel.find((x) => x.name === global.actualChannel);
}