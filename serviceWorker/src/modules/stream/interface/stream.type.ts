export const streams = {
  picture: { playerType: "thunderdome", name: "lower" },
  local: { playerType: "embed", name: "normal" },
  frontpage: { playerType: "frontpage", name: "frontpage" },
  localSite: { playerType: "site", name: "site" },
  external: { name: "external" },
  dns: { name: "dns" },
};

export type streamType = {
  playerType?: string;
  name: string;
};
