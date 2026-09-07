import { miniBoard } from './board-mini';
import { standardBoard } from './board-standard';
import type {
  BlockedCapture,
  BoardDefinition,
  GameConfig,
  GameState,
  Move,
  NodeId,
  Piece,
  PlayerSide,
  WinReason,
  WinSummary,
  Winner
} from './types';

export function getBoard(variant: GameConfig['variant']): BoardDefinition {
  switch (variant) {
    case 'mini':
      return miniBoard;
    case 'standard':
      return standardBoard;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function clonePieces(pieces: Partial<Record<NodeId, Piece>>): Partial<Record<NodeId, Piece>> {
  return { ...pieces };
}

const REPETITION_DRAW_THRESHOLD = 3;

export function positionKey(state: GameState): string {
  const pieces = Object.entries(state.pieces).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify({
    variant: state.variant,
    phase: state.phase,
    turn: state.turn,
    goatsToPlace: state.goatsToPlace,
    captures: state.captures,
    pieces
  });
}

function recordPosition(state: GameState): GameState {
  const positionCounts = { ...state.positionCounts };
  const key = positionKey(state);
  positionCounts[key] = (positionCounts[key] ?? 0) + 1;
  return { ...state, positionCounts };
}

export function createGame(config: GameConfig): GameState {
  const board = getBoard(config.variant);
  const pieces = clonePieces(board.initialPieces);
  const goatsOnBoard = Object.values(pieces).filter((piece) => piece === 'goat').length;

  const game: GameState = {
    variant: config.variant,
    phase: config.variant === 'standard' ? 'placement' : 'movement',
    turn: config.variant === 'standard' ? 'goat' : 'tiger',
    pieces,
    goatsRemaining: board.goatCount,
    goatsOnBoard,
    goatsToPlace: config.variant === 'standard' ? board.goatCount - goatsOnBoard : 0,
    captures: 0,
    winner: null,
    humanSide: config.humanSide,
    positionCounts: {}
  };

  return recordPosition(game);
}

function pieceAt(state: GameState, node: NodeId): Piece | undefined {
  return state.pieces[node];
}

function isEmpty(state: GameState, node: NodeId): boolean {
  return pieceAt(state, node) === undefined;
}

function opponent(side: PlayerSide): PlayerSide {
  return side === 'tiger' ? 'goat' : 'tiger';
}

export function getTurn(state: GameState): PlayerSide {
  return state.turn;
}

export function isCpuTurn(state: GameState): boolean {
  return state.winner === null && state.turn !== state.humanSide;
}

function tigerMoves(state: GameState, board: BoardDefinition, from: NodeId): Move[] {
  const moves: Move[] = [];
  const node = board.nodes[from];
  if (!node || pieceAt(state, from) !== 'tiger') return moves;

  for (const to of node.neighbors) {
    if (isEmpty(state, to)) {
      moves.push({ kind: 'move', from, to });
    }
  }

  for (const [to, over] of Object.entries(node.jumps) as [NodeId, NodeId][]) {
    if (isEmpty(state, to) && pieceAt(state, over) === 'goat') {
      moves.push({ kind: 'jump', from, to, over });
    }
  }

  return moves;
}

function goatMoves(state: GameState, board: BoardDefinition, from: NodeId): Move[] {
  const moves: Move[] = [];
  const node = board.nodes[from];
  if (!node || pieceAt(state, from) !== 'goat') return moves;

  for (const to of node.neighbors) {
    if (isEmpty(state, to)) {
      moves.push({ kind: 'move', from, to });
    }
  }

  return moves;
}

function goatPlacements(state: GameState, board: BoardDefinition): Move[] {
  if (state.phase !== 'placement' || state.goatsToPlace <= 0) return [];

  return (Object.keys(board.nodes) as NodeId[])
    .filter((node) => isEmpty(state, node))
    .map((to) => ({ kind: 'place' as const, to }));
}

export function getLegalMoves(state: GameState): Move[] {
  if (state.winner !== null) return [];

  const board = getBoard(state.variant);

  if (state.turn === 'goat') {
    if (state.phase === 'placement') {
      return goatPlacements(state, board);
    }

    return (Object.keys(state.pieces) as NodeId[])
      .filter((node) => pieceAt(state, node) === 'goat')
      .flatMap((from) => goatMoves(state, board, from));
  }

  return (Object.keys(state.pieces) as NodeId[])
    .filter((node) => pieceAt(state, node) === 'tiger')
    .flatMap((from) => tigerMoves(state, board, from));
}

export function getBlockedCaptures(state: GameState, from: NodeId): BlockedCapture[] {
  if (state.winner !== null || state.turn !== 'tiger') return [];

  const board = getBoard(state.variant);
  const node = board.nodes[from];
  if (!node || pieceAt(state, from) !== 'tiger') return [];

  const blocked: BlockedCapture[] = [];
  for (const [to, over] of Object.entries(node.jumps) as [NodeId, NodeId][]) {
    if (pieceAt(state, over) === 'goat' && !isEmpty(state, to)) {
      blocked.push({ from, over, to });
    }
  }
  return blocked;
}

export function findTigerNode(state: GameState): NodeId | null {
  for (const [node, piece] of Object.entries(state.pieces)) {
    if (piece === 'tiger') return node as NodeId;
  }
  return null;
}

export function resolveActiveTiger(state: GameState, selected: NodeId | null): NodeId | null {
  if (selected && state.pieces[selected] === 'tiger') return selected;
  if (state.variant === 'mini') return findTigerNode(state);
  return null;
}

function tigerHasMoves(state: GameState, board: BoardDefinition): boolean {
  return (Object.keys(state.pieces) as NodeId[])
    .filter((node) => pieceAt(state, node) === 'tiger')
    .some((from) => tigerMoves(state, board, from).length > 0);
}

function goatHasMoves(state: GameState, board: BoardDefinition): boolean {
  if (state.phase === 'placement' && state.goatsToPlace > 0) return true;

  return (Object.keys(state.pieces) as NodeId[])
    .filter((node) => pieceAt(state, node) === 'goat')
    .some((from) => goatMoves(state, board, from).length > 0);
}

function getWinReason(state: GameState, board: BoardDefinition): WinReason | null {
  if (state.captures >= board.captureWinThreshold) {
    return 'captures';
  }

  if (state.turn === 'goat' && !goatHasMoves(state, board)) {
    return 'goats-stalled';
  }

  if (state.turn === 'tiger' && !tigerHasMoves(state, board)) {
    return 'tiger-trapped';
  }

  return null;
}

export function checkWinner(state: GameState): Winner {
  if (state.winner === 'draw') return 'draw';

  const board = getBoard(state.variant);
  const reason = getWinReason(state, board);
  if (reason === 'captures' || reason === 'goats-stalled') return 'tiger';
  if (reason === 'tiger-trapped') return 'goat';
  return null;
}

export function getWinSummary(state: GameState): WinSummary | null {
  if (state.winner === null) return null;

  if (state.winner === 'draw') {
    return {
      winner: 'draw',
      reason: 'repetition',
      humanWon: false,
      title: 'Draw',
      subtitle: 'The same position occurred three times'
    };
  }

  const board = getBoard(state.variant);
  const reason = getWinReason(state, board);
  if (reason === null) return null;

  const humanWon = state.winner === state.humanSide;
  let subtitle: string;

  switch (reason) {
    case 'captures':
      subtitle = `Captured ${state.captures} of ${board.captureWinThreshold} goats needed to win`;
      break;
    case 'tiger-trapped':
      subtitle = 'The tiger has no legal moves';
      break;
    case 'goats-stalled':
      subtitle =
        state.phase === 'placement'
          ? 'Goats cannot be placed or moved'
          : 'Goats have no legal moves';
      break;
    case 'repetition':
      subtitle = 'The same position occurred three times';
      break;
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }

  return {
    winner: state.winner,
    reason,
    humanWon,
    title: humanWon ? 'You win!' : 'You lose',
    subtitle
  };
}

function advanceTurn(state: GameState): Pick<GameState, 'turn' | 'phase'> {
  const phase =
    state.variant === 'standard' && state.phase === 'placement' && state.goatsToPlace <= 0
      ? 'movement'
      : state.phase;

  return { turn: opponent(state.turn), phase };
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.winner !== null) return state;

  const legal = getLegalMoves(state);
  const isLegal = legal.some((candidate) => movesEqual(candidate, move));
  if (!isLegal) return state;

  const next: GameState = {
    ...state,
    pieces: clonePieces(state.pieces),
    captures: state.captures,
    goatsRemaining: state.goatsRemaining,
    goatsOnBoard: state.goatsOnBoard,
    goatsToPlace: state.goatsToPlace,
    phase: state.phase,
    turn: state.turn,
    winner: null,
    positionCounts: state.positionCounts
  };

  switch (move.kind) {
    case 'place':
      next.pieces[move.to] = 'goat';
      next.goatsOnBoard += 1;
      next.goatsToPlace -= 1;
      Object.assign(next, advanceTurn(next));
      break;
    case 'move':
      delete next.pieces[move.from];
      next.pieces[move.to] = state.turn;
      Object.assign(next, advanceTurn(next));
      break;
    case 'jump':
      delete next.pieces[move.from];
      delete next.pieces[move.over];
      next.pieces[move.to] = 'tiger';
      next.captures += 1;
      next.goatsRemaining -= 1;
      next.goatsOnBoard -= 1;
      Object.assign(next, advanceTurn(next));
      break;
    default: {
      const _exhaustive: never = move;
      return _exhaustive;
    }
  }

  const recorded = recordPosition(next);
  const key = positionKey(recorded);
  if ((recorded.positionCounts[key] ?? 0) >= REPETITION_DRAW_THRESHOLD) {
    recorded.winner = 'draw';
    return recorded;
  }

  recorded.winner = checkWinner(recorded);
  return recorded;
}

function movesEqual(a: Move, b: Move): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'place':
      return b.kind === 'place' && a.to === b.to;
    case 'move':
      return b.kind === 'move' && a.from === b.from && a.to === b.to;
    case 'jump':
      return b.kind === 'jump' && a.from === b.from && a.to === b.to && a.over === b.over;
    default: {
      const _exhaustive: never = a;
      return _exhaustive;
    }
  }
}

export function moveTarget(move: Move): NodeId {
  switch (move.kind) {
    case 'place':
      return move.to;
    case 'move':
    case 'jump':
      return move.to;
    default: {
      const _exhaustive: never = move;
      return _exhaustive;
    }
  }
}

export function moveSource(move: Move): NodeId | null {
  switch (move.kind) {
    case 'place':
      return null;
    case 'move':
    case 'jump':
      return move.from;
    default: {
      const _exhaustive: never = move;
      return _exhaustive;
    }
  }
}
