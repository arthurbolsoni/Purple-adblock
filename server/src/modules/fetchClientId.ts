import fetch from "cross-fetch";

const url = "https://static.twitchcdn.net/assets/core-fc4fce6327f604c4358d.js";
let allowed = true;
const clientId = "";

export default async function (): Promise<string> {
  if (!allowed) {
    return clientId;
  }
  resetTimeout();
  return fetchTwitchClientId();
}

async function fetchTwitchClientId(): Promise<string> {
  const regex = /clientID:"(.{0,32})",cookieName:"twilight-user"/;
  const r = await fetch(url);
  const content = await r.text();
  const match = regex.exec(content);
  if (match != null) {
    process.env.TWITCH_CLIENT_ID = match[1];
    return match[1];
  } else {
    return "";
  }
}

function resetTimeout() {
  setTimeout(() => {
    allowed = true;
  }, 60 * 1000);
}
