import { describe, expect, it } from 'vitest';
import { applyMove, createGame, getLegalMoves, moveSource, moveTarget } from './engine';

function findMoveToNode(
  legalMoves: ReturnType<typeof getLegalMoves>,
  nodeId: string,
  selected: string | null
) {
  const candidates = legalMoves.filter((candidate) => moveTarget(candidate) === nodeId);
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  if (selected) {
    return candidates.find((candidate) => moveSource(candidate) === selected);
  }
  return undefined;
}

describe('board click routing during placement', () => {
  it('does not treat tiger move targets as goat placements', () => {
    let game = createGame({ variant: 'standard', humanSide: 'tiger' });
    game = applyMove(game, getLegalMoves(game)[0]);
    expect(game.turn).toBe('tiger');

    const legalMoves = getLegalMoves(game).filter((move) => moveSource(move) === 'n0');
    const target = moveTarget(legalMoves[0]!);
    const placementOnly = legalMoves.find(
      (candidate) => candidate.kind === 'place' && candidate.to === target
    );

    expect(placementOnly).toBeUndefined();
    expect(findMoveToNode(legalMoves, target, 'n0')).toEqual(legalMoves[0]);
    expect(applyMove(game, legalMoves[0]!).pieces[target]).toBe('tiger');
  });
});
