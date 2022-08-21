export const streams = {
    picture: { playerType: "thunderdome", name: "lower" },
    local: { playerType: "site", name: "normal" },
    external: { name: "external" }
}

export type streamType = {
    playerType?: string;
    name: string;
}