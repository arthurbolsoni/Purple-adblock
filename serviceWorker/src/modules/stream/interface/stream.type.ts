export const streams = {
  picture: { playerType: "thunderdome", name: "lower" },
  local: { playerType: "embed", name: "normal" },
  external: { name: "external" },
  dns: { name: "dns" },
};

export type streamType = {
  playerType?: string;
  name: string;
};
