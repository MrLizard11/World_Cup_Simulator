import { Team } from "./team.model";

export interface KnockoutMatch {
    winner: string;
    teamA: Team;
    teamB: Team;
    scoreA?: number;
    scoreB?: number;
    penaltyScoreA?: number;
    penaltyScoreB?: number;
    wentToPenalties?: boolean;
    played: boolean;
    round: 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final';
}
export interface KnockoutStage {
    roundOf16: KnockoutMatch[];
    quarterFinals: KnockoutMatch[];
    semiFinals: KnockoutMatch[];
    final: KnockoutMatch | null;
}

