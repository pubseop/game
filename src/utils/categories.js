export const UPPER_CATEGORIES = [
  { id: 'ones',   label: '에이스', diceValue: 1, min: 0, max: 5  },
  { id: 'twos',   label: '듀얼',   diceValue: 2, min: 0, max: 10 },
  { id: 'threes', label: '트리플', diceValue: 3, min: 0, max: 15 },
  { id: 'fours',  label: '쿼드',   diceValue: 4, min: 0, max: 20 },
  { id: 'fives',  label: '펜타',   diceValue: 5, min: 0, max: 25 },
  { id: 'sixes',  label: '헥사',   diceValue: 6, min: 0, max: 30 },
];

export const LOWER_CATEGORIES = [
  { id: 'choice',         label: '초이스',        min: 0, max: 30 },
  { id: 'fourOfAKind',    label: '포커',         min: 0, max: 30 },
  { id: 'fullHouse',      label: '풀하우스',     min: 0, max: 28 },
  { id: 'littleStraight', label: '스몰스트레이트', min: 0, max: 15, fixedScore: 15 },
  { id: 'bigStraight',    label: '라지스트레이트', min: 0, max: 30, fixedScore: 30 },
  { id: 'yacht',          label: '요트',          min: 0, max: 50, fixedScore: 50 },
];

export const ALL_CATEGORIES = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES];
export const BONUS_THRESHOLD = 63;
export const BONUS_SCORE     = 35;
export const MAX_PLAYERS     = 8;

export function createInitialScores() {
  return Object.fromEntries(ALL_CATEGORIES.map(c => [c.id, null]));
}
