const KEY = 'crystalCaveM2';

const DEFAULT = {
  character: 'bear',
  crystals: [false, false, false, false], // one per island
  islandReached: 1,
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function setCrystal(registry, index) {
  const state = load();
  state.crystals[index] = true;
  state.islandReached = Math.max(state.islandReached, index + 2);
  save(state);
  registry.set('crystals', state.crystals);
}

export function setCharacter(registry, key) {
  const state = load();
  state.character = key;
  save(state);
  registry.set('selectedCharacter', key);
}

export function primeRegistry(registry) {
  const state = load();
  registry.set('selectedCharacter', state.character);
  registry.set('crystals', [...state.crystals]);
  registry.set('islandReached', state.islandReached);
}

export function reset() {
  localStorage.removeItem(KEY);
}

export function crystalCount(registry) {
  const c = registry.get('crystals') || [false, false, false, false];
  return c.filter(Boolean).length;
}
