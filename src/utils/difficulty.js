// Difficulty config keyed by selectedCharacter.
// Levi = easiest, Finley = medium, Luke = hard, Sokchea = expert.

export const DIFFICULTY_CONFIG = {
  levi: {
    label:           'Easy',
    stars:           '⭐',
    color:           '#88FF88',
    // Simon Says
    simonLength:     5,
    simonLives:      5,
    // Match-3 battle
    monsterHp:       3,
    attackInterval:  20000,
    // Crystal smash (Island 3)
    crystalsNeeded:  5,
    crystalLifetime: 4500,
    crystalSpawn:    1800,
    // Color Rush (Island 3)
    colorCount:      2,
    colorTarget:     8,
    gemFallSpeed:    140,
    gemSpawnMs:      1200,
    // Trivia (Island 4)
    needCorrect:     3,
    hintAllowed:     true,
  },
  finley: {
    label:           'Medium',
    stars:           '⭐⭐',
    color:           '#FFEE88',
    simonLength:     7,
    simonLives:      4,
    monsterHp:       4,
    attackInterval:  15000,
    crystalsNeeded:  10,
    crystalLifetime: 3500,
    crystalSpawn:    1500,
    colorCount:      3,
    colorTarget:     12,
    gemFallSpeed:    200,
    gemSpawnMs:      1000,
    needCorrect:     3,
    hintAllowed:     true,
  },
  luke: {
    label:           'Hard',
    stars:           '⭐⭐⭐',
    color:           '#FFAA44',
    simonLength:     9,
    simonLives:      3,
    monsterHp:       5,
    attackInterval:  12000,
    crystalsNeeded:  15,
    crystalLifetime: 2800,
    crystalSpawn:    1200,
    colorCount:      3,
    colorTarget:     15,
    gemFallSpeed:    280,
    gemSpawnMs:      800,
    needCorrect:     4,
    hintAllowed:     true,
  },
  sokchea: {
    label:           'Expert',
    stars:           '⭐⭐⭐⭐',
    color:           '#FF6666',
    simonLength:     10,
    simonLives:      3,
    monsterHp:       7,
    attackInterval:  8000,
    crystalsNeeded:  20,
    crystalLifetime: 2200,
    crystalSpawn:    900,
    colorCount:      4,
    colorTarget:     20,
    gemFallSpeed:    370,
    gemSpawnMs:      600,
    needCorrect:     4,
    hintAllowed:     false,
  },
};

export function getDifficulty(registry) {
  const char = registry.get('selectedCharacter') || 'luke';
  return DIFFICULTY_CONFIG[char] ?? DIFFICULTY_CONFIG.luke;
}
