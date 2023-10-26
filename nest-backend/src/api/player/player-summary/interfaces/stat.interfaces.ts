export interface Accuracy {
    bodyshots: number;
    headshots: number;
    legshots: number;
}

export interface AgentStats {
    assists: number;
    counts: number;
    deaths: number;
    kills: number;
    losses: number;
    roundsPlayed: number;
    totalAverageCombatScore: number;
    wins: number;
}

export interface MapStats {
    counts: number;
    losses: number;
    wins: number;
}

export interface Position {
    assists: number;
    counts: number;
    deaths: number;
    kills: number;
    losses: number;
    roundsPlayed: number;
    wins: number;
}

export interface Weapon {
    bodyshots: number;
    headshots: number;
    kills: number;
    legshots: number;
}