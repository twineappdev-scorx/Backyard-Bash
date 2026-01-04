
export enum MatchFormat {
  T20 = 'T20',
  Overs = 'Overs',
  Unlimited = 'Unlimited',
  OneVsOne = '1v1'
}

export interface SpecialRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  customRuns?: number;
  customWickets?: number;
}

export interface PlayerStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  outMethod?: string;
}

export interface MatchSettings {
  format: MatchFormat;
  oversPerInnings: number;
  wicketsPerInnings: number;
  numberOfInnings: number;
  specialRules: SpecialRule[];
}

export interface BallRecord {
  batsmanName: string;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'Wide' | 'No Ball';
  wicketType?: string;
  timestamp: number;
}

export interface Innings {
  batsmen: PlayerStats[];
  balls: BallRecord[];
  totalScore: number;
  totalWickets: number;
  totalOvers: number;
  totalBalls: number;
}
