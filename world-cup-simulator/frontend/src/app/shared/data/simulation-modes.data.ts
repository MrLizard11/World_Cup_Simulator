import { SimulationMode } from '../services/simulation-mode.service';

export interface ModeInfo {
  mode: SimulationMode;
  name: string;
  tagline: string;
  description: string;
  technicalPoints: string[];
  example: {
    teamA: string;
    teamB: string;
    probability: string;
    typicalScore: string;
  };
  pros: string[];
  cons: string[];
}

export const SIMULATION_MODES_DATA: ModeInfo[] = [
  {
    mode: SimulationMode.RANDOM,
    name: 'Random Mode',
    tagline: 'Pure chaos - anything can happen!',
    description: 'Each team gets a completely random score between 0-4 goals. Team strength has no impact on the result.',
    technicalPoints: [
      'Each team: Math.floor(Math.random() * 5) goals',
      'No Elo ratings considered',
      'Uniform distribution (all scores equally likely)',
      'Fastest computation speed'
    ],
    example: {
      teamA: 'Spain (2156)',
      teamB: 'San Marino (1200)',
      probability: '50% each to win',
      typicalScore: 'Any score from 0-0 to 4-4'
    },
    pros: [
      'Completely unpredictable and exciting',
      'Every team has equal chance',
      'Good for testing system functionality',
      'Creates memorable upset stories'
    ],
    cons: [
      'Unrealistic results',
      'Strong teams lose as often as weak teams',
      'No strategic element',
      'Can frustrate users expecting realism'
    ]
  },
  {
    mode: SimulationMode.ELO_SIMPLE,
    name: 'Elo Simple',
    tagline: 'Random scores with team strength multipliers',
    description: 'Generates random base scores, then applies strength multipliers based on Elo rating differences.',
    technicalPoints: [
      'Base random score (0-4) for each team',
      'Strength factor = 1.0 + tanh(eloDiff/300) * 0.6',
      'Final score = baseScore * strengthFactor',
      'Quick calculation, noticeable team differences'
    ],
    example: {
      teamA: 'Brazil (2001)',
      teamB: 'Ghana (1478)',
      probability: '~65% Brazil wins',
      typicalScore: 'Brazil often outscores by 1-2 goals'
    },
    pros: [
      'Team strength clearly matters',
      'Still allows for upsets',
      'Fast computation',
      'Easy to understand logic'
    ],
    cons: [
      'Less sophisticated than advanced modes',
      'Goal distributions not realistic',
      'May produce extreme scores',
      'Doesn\'t account for match importance'
    ]
  },
  {
    mode: SimulationMode.ELO_REALISTIC,
    name: 'Elo Realistic',
    tagline: 'Statistically accurate football simulation',
    description: 'Uses proper Elo win probability calculations combined with Poisson distribution for realistic goal generation.',
    technicalPoints: [
      'Win probability: 1/(1 + 10^(-(eloA-eloB)/400))',
      'Goal expectation based on team strength difference',
      'Poisson distribution for goal generation',
      'Average ~2.8 goals per match (realistic)'
    ],
    example: {
      teamA: 'Argentina (2131)',
      teamB: 'Mexico (1860)',
      probability: '~71% Argentina wins',
      typicalScore: '2-1, 3-0, 1-0 type results'
    },
    pros: [
      'Statistically accurate results',
      'Realistic goal distributions',
      'Based on actual football data',
      'Good balance of predictability and surprises'
    ],
    cons: [
      'Slightly slower computation',
      'May be too predictable for some users',
      'Requires understanding of statistics',
      'Less dramatic than random mode'
    ]
  },
  {
    mode: SimulationMode.ELO_ADVANCED,
    name: 'Elo Advanced',
    tagline: 'Professional-grade tournament simulation',
    description: 'Most sophisticated mode including match importance, team form, situational factors, and controlled randomness.',
    technicalPoints: [
      'Elo calculations + situational multipliers',
      'Match importance: Finals (1.2x), Semis (1.15x), Groups (1.0x)',
      'Team form factors (0.8x to 1.2x possible)',
      '15% randomness factor for realistic upsets'
    ],
    example: {
      teamA: 'France (2055)',
      teamB: 'Croatia (1926)',
      probability: '~62% France (varies by round)',
      typicalScore: 'Lower scoring in finals, higher in groups'
    },
    pros: [
      'Most realistic tournament simulation',
      'Accounts for match pressure',
      'Includes team form variations',
      'Controlled upset frequency'
    ],
    cons: [
      'Most complex calculations',
      'Hardest to predict exact outcomes',
      'May require explanation to users',
      'Slowest computation speed'
    ]
  }
];
