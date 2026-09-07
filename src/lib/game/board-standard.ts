import type { BoardDefinition, StandardNodeId } from './types';

/** Standard 5×5 Bagh-chaal board (25 nodes, indexed n0–n24 row-major). */
function nodeId(index: number): StandardNodeId {
  return `n${index}` as StandardNodeId;
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

function getJumpOver(from: number, to: number): number | null {
  const diff = to - from;
  if (Math.abs(diff) === 2) return from + diff / 2;
  if (Math.abs(diff) === 10) return from + diff / 2;
  if (Math.abs(diff) === 11) return from + (diff > 0 ? 6 : -6);
  if (Math.abs(diff) === 9) return from + (diff > 0 ? 4 : -4);
  return null;
}

const nodes = {} as BoardDefinition['nodes'];
const edges: [StandardNodeId, StandardNodeId][] = [];
const seenEdges = new Set<string>();

for (let i = 0; i < 25; i += 1) {
  const id = nodeId(i);
  const neighborIds = getNeighbors(i);
  const jumpMap: Partial<Record<StandardNodeId, StandardNodeId>> = {};

  for (const neighbor of neighborIds) {
    const neighborIndex = Number(neighbor.slice(1));
    for (const landing of getNeighbors(neighborIndex)) {
      const landingIndex = Number(landing.slice(1));
      const over = getJumpOver(i, landingIndex);
      if (over === neighborIndex) {
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
    coord: [(i % 5) * 100 + 50, Math.floor(i / 5) * 100 + 50],
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
