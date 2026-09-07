import type { BoardDefinition, StandardNodeId } from './types';

/** Standard 5×5 Bagh-chaal board (25 nodes, indexed n0–n24 row-major). */
function nodeId(index: number): StandardNodeId {
  return `n${index}` as StandardNodeId;
}

function coord(index: number): [number, number] {
  return [(index % 5) * 100 + 50, Math.floor(index / 5) * 100 + 50];
}

function isOnBoard(index: number): boolean {
  return index >= 0 && index <= 24;
}

/** Left column cannot connect directly to right column (and vice versa). */
function pathExists(from: number, to: number): boolean {
  const impossibleFrom = [0, 5, 10, 15, 20];
  const impossibleTo = [4, 9, 14, 19, 24];
  return !(
    (impossibleFrom.includes(from) && impossibleTo.includes(to)) ||
    (impossibleFrom.includes(to) && impossibleTo.includes(from))
  );
}

function getNeighbors(index: number): StandardNodeId[] {
  const candidates: number[][] =
    index % 2 === 0
      ? [
          [index - 1, index + 1],
          [index + 5, index + 5 - 1, index + 5 + 1],
          [index - 5, index - 5 - 1, index - 5 + 1]
        ]
      : [[index - 1, index + 1], [index + 5], [index - 5]];

  const result: StandardNodeId[] = [];
  for (const group of candidates) {
    for (const point of group) {
      if (isOnBoard(point) && pathExists(index, point)) {
        result.push(nodeId(point));
      }
    }
  }
  return result;
}

/** Tiger must jump in a straight line with the goat exactly halfway between. */
function isJumpLine(from: [number, number], over: [number, number], to: [number, number]): boolean {
  const v1x = over[0] - from[0];
  const v1y = over[1] - from[1];
  const v2x = to[0] - over[0];
  const v2y = to[1] - over[1];

  if (v1x === 0 && v1y === 0) return false;
  if (v2x === 0 && v2y === 0) return false;
  if (v1x * v2y !== v1y * v2x) return false;
  if (Math.sign(v1x) !== Math.sign(v2x) || Math.sign(v1y) !== Math.sign(v2y)) return false;

  const d1 = v1x * v1x + v1y * v1y;
  const d2 = v2x * v2x + v2y * v2y;
  return d1 === d2;
}

const nodes = {} as BoardDefinition['nodes'];
const edges: [StandardNodeId, StandardNodeId][] = [];
const seenEdges = new Set<string>();

for (let i = 0; i < 25; i += 1) {
  const id = nodeId(i);
  const fromCoord = coord(i);
  const neighborIds = getNeighbors(i);
  const jumpMap: Partial<Record<StandardNodeId, StandardNodeId>> = {};

  for (const neighbor of neighborIds) {
    const neighborIndex = Number(neighbor.slice(1));
    const overCoord = coord(neighborIndex);

    for (const landing of getNeighbors(neighborIndex)) {
      const landingIndex = Number(landing.slice(1));
      if (landingIndex === i) continue;

      if (isJumpLine(fromCoord, overCoord, coord(landingIndex))) {
        jumpMap[landing] = neighbor;
      }
    }

    const edgeKey = id < neighbor ? `${id}-${neighbor}` : `${neighbor}-${id}`;
    if (!seenEdges.has(edgeKey)) {
      seenEdges.add(edgeKey);
      edges.push([id, neighbor]);
    }
  }

  nodes[id] = {
    id,
    label: String(i),
    coord: fromCoord,
    neighbors: neighborIds,
    jumps: jumpMap
  };
}

export const standardBoard: BoardDefinition = {
  variant: 'standard',
  nodes,
  edges,
  initialPieces: {
    n0: 'tiger',
    n4: 'tiger',
    n20: 'tiger',
    n24: 'tiger'
  },
  tigerCount: 4,
  goatCount: 20,
  captureWinThreshold: 5
};

export const STANDARD_NODE_IDS = Array.from({ length: 25 }, (_, i) => nodeId(i));
