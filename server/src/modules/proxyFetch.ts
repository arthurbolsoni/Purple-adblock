import fetch from "../utils/fetchWithTimeout";
import HttpsProxyAgent from "https-proxy-agent";

export default async function requestUrlByProxy(id: string, server: string) {
  if (id && server) {
    try {
      const returning = await fetch(
        "https://video-weaver." + server.slice(0, 5) + ".hls.ttvnw.net/v1/playlist/" + id + ".m3u8",
        {
          // This wont work because... well, there's no proxy, as well as agent's aren't supported in cross-fetch/node-fetch
          // agent: new HttpsProxyAgent(''),
          method: "GET",
        },
        4000,
      );
      return returning.status == 200;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}
