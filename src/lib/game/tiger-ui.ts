import { getLegalMoves, moveSource } from './engine';
import type { GameState, Move, NodeId } from './types';

export function resolveStandardTiger(
  game: GameState,
  selected: NodeId | null,
  lastTigerNode: NodeId | null
): NodeId | null {
  if (selected && game.pieces[selected] === 'tiger') return selected;
  if (lastTigerNode && game.pieces[lastTigerNode] === 'tiger') return lastTigerNode;

  const moves = getLegalMoves(game);
  return moves.map((move) => moveSource(move)).find((node) => node !== null) ?? null;
}

export function getStandardTigerLegalMoves(
  game: GameState,
  selected: NodeId | null,
  lastTigerNode: NodeId | null
): Move[] {
  const tiger = resolveStandardTiger(game, selected, lastTigerNode);
  if (!tiger) return [];

  return getLegalMoves(game).filter((move) => moveSource(move) === tiger);
}

export function getSelectedTigerMoves(
  game: GameState,
  selected: NodeId | null,
  lastTigerNode: NodeId | null
): Move[] {
  return getStandardTigerLegalMoves(game, selected, lastTigerNode);
}
