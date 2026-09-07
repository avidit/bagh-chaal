export type Piece = 'tiger' | 'goat';

export type MiniNodeId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

export type StandardNodeId =
  | 'n0'
  | 'n1'
  | 'n2'
  | 'n3'
  | 'n4'
  | 'n5'
  | 'n6'
  | 'n7'
  | 'n8'
  | 'n9'
  | 'n10'
  | 'n11'
  | 'n12'
  | 'n13'
  | 'n14'
  | 'n15'
  | 'n16'
  | 'n17'
  | 'n18'
  | 'n19'
  | 'n20'
  | 'n21'
  | 'n22'
  | 'n23'
  | 'n24';

export type NodeId = MiniNodeId | StandardNodeId;

export type GameVariant = 'mini' | 'standard';

export type PlayerSide = 'tiger' | 'goat';

export type GamePhase = 'playing' | 'placement' | 'movement';

export type Winner = PlayerSide | null;

export type WinReason = 'captures' | 'tiger-trapped' | 'goats-stalled';

export interface WinSummary {
  winner: PlayerSide;
  reason: WinReason;
  humanWon: boolean;
  title: string;
  subtitle: string;
}

export interface BlockedCapture {
  from: NodeId;
  over: NodeId;
  to: NodeId;
}

export type Move =
  | { kind: 'move'; from: NodeId; to: NodeId }
  | { kind: 'jump'; from: NodeId; to: NodeId; over: NodeId }
  | { kind: 'place'; to: NodeId };

export interface BoardNode {
  id: NodeId;
  label: string;
  coord: [number, number];
  neighbors: NodeId[];
  jumps: Partial<Record<NodeId, NodeId>>;
}

export interface BoardDefinition {
  variant: GameVariant;
  nodes: Record<NodeId, BoardNode>;
  edges: [NodeId, NodeId][];
  decorativeEdges?: [NodeId, NodeId][];
  initialPieces: Partial<Record<NodeId, Piece>>;
  tigerCount: number;
  goatCount: number;
  captureWinThreshold: number;
}

export interface GameState {
  variant: GameVariant;
  phase: GamePhase;
  turn: PlayerSide;
  pieces: Partial<Record<NodeId, Piece>>;
  goatsRemaining: number;
  goatsOnBoard: number;
  goatsToPlace: number;
  captures: number;
  winner: Winner;
  humanSide: PlayerSide;
}

export interface GameConfig {
  variant: GameVariant;
  humanSide: PlayerSide;
}
