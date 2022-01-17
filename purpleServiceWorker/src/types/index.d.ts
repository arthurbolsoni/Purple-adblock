interface qualityUrl {
  url: string;
  quality: string;
}

interface streamServer {
  server: string;
  urlList: qualityUrl[];
  sig: boolean;
}

interface streamList {
  server: string;
  urlList: qualityUrl[];
}

interface playlistItem {
  time: string;
  timestamp: number;
  info: string;
  url: string;
}
