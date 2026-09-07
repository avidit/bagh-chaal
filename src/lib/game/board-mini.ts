import type { BoardDefinition, MiniNodeId } from './types';

/** 10-node mini board (A–J). E↔H and G↔J are not playable. */
const neighbors: Record<MiniNodeId, MiniNodeId[]> = {
  a: ['b', 'c', 'd'],
  b: ['a', 'c', 'e'],
  c: ['a', 'b', 'd'],
  d: ['a', 'c', 'g'],
  e: ['b', 'f'],
  f: ['e', 'g', 'i'],
  g: ['d', 'f'],
  h: ['i'],
  i: ['f', 'h', 'j'],
  j: ['i']
};

const jumps: Record<MiniNodeId, Partial<Record<MiniNodeId, MiniNodeId>>> = {
  a: { e: 'b', g: 'd' },
  b: { d: 'c' },
  c: {},
  d: { b: 'c' },
  e: { a: 'b', g: 'f' },
  f: {},
  g: { a: 'd', e: 'f' },
  h: { j: 'i' },
  i: {},
  j: { h: 'i' }
};

const coords: Record<MiniNodeId, [number, number]> = {
  a: [250, 50],
  b: [175, 150],
  c: [250, 150],
  d: [325, 150],
  e: [100, 250],
  f: [250, 250],
  g: [400, 250],
  h: [100, 400],
  i: [250, 400],
  j: [400, 400]
};

const labels: Record<MiniNodeId, string> = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  h: 'H',
  i: 'I',
  j: 'J'
};

function uniqueEdges(pairs: [MiniNodeId, MiniNodeId][]): [MiniNodeId, MiniNodeId][] {
  const seen = new Set<string>();
  return pairs.filter(([from, to]) => {
    const key = from < to ? `${from}-${to}` : `${to}-${from}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const edgePairs: [MiniNodeId, MiniNodeId][] = uniqueEdges(
  (Object.entries(neighbors) as [MiniNodeId, MiniNodeId[]][]).flatMap(([from, list]) =>
    list.map((to): [MiniNodeId, MiniNodeId] => [from, to])
  )
);

export const miniBoard: BoardDefinition = {
  variant: 'mini',
  nodes: (Object.keys(neighbors) as MiniNodeId[]).reduce(
    (acc, id) => {
      acc[id] = {
        id,
        label: labels[id],
        coord: coords[id],
        neighbors: neighbors[id],
        jumps: jumps[id]
      };
      return acc;
    },
    {} as BoardDefinition['nodes']
  ),
  edges: edgePairs,
  initialPieces: {
    a: 'tiger',
    h: 'goat',
    i: 'goat',
    j: 'goat'
  },
  tigerCount: 1,
  goatCount: 3,
  captureWinThreshold: 2
};

export const MINI_NODE_IDS = Object.keys(neighbors) as MiniNodeId[];
