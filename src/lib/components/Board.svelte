<script lang="ts">
  import { getBoard, moveSource, moveTarget } from '$lib/game/engine';
  import type { BoardNode, GameState, Move, NodeId } from '$lib/game/types';
  import { pieceImages } from '$lib/pieces';

  interface Props {
    game: GameState;
    legalMoves?: Move[];
    selected?: NodeId | null;
    movableGoatNodes?: Set<NodeId>;
    movableTigerNodes?: Set<NodeId>;
    onSelect?: (node: NodeId | null) => void;
    onMove?: (move: Move) => void;
  }

  let {
    game,
    legalMoves = [],
    selected = $bindable(null),
    movableGoatNodes = new Set<NodeId>(),
    movableTigerNodes = new Set<NodeId>(),
    onSelect = () => {},
    onMove = () => {}
  }: Props = $props();

  const board = $derived(getBoard(game.variant));
  const pieceSize = $derived(game.variant === 'mini' ? 50 : 36);
  const viewBox = $derived.by(() => {
    const coords = Object.values(board.nodes).map((node) => node.coord);
    const xs = coords.map(([x]) => x);
    const ys = coords.map(([, y]) => y);
    const padding = 40;
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    return `${centerX - size / 2} ${centerY - size / 2} ${size} ${size}`;
  });

  const legalTargets = $derived(new Set(legalMoves.map((move) => moveTarget(move))));
  const captureJumps = $derived(legalMoves.filter((move) => move.kind === 'jump'));
  const captureLandings = $derived(new Set(captureJumps.map((move) => moveTarget(move))));
  const capturableGoats = $derived(new Set(captureJumps.map((move) => move.over)));
  const nodeList = $derived(Object.values(board.nodes));
  const interactiveNodes = $derived(
    nodeList.filter((node) => isNodeInteractive(node.id, game.pieces[node.id]))
  );
  const backgroundNodes = $derived(
    nodeList.filter((node) => !isNodeInteractive(node.id, game.pieces[node.id]))
  );

  function findMoveToNode(nodeId: NodeId): Move | undefined {
    const candidates = legalMoves.filter((candidate) => moveTarget(candidate) === nodeId);
    if (candidates.length === 0) return undefined;
    if (candidates.length === 1) return candidates[0];

    if (selected) {
      const selectedMove = candidates.find((candidate) => moveSource(candidate) === selected);
      if (selectedMove) return selectedMove;
    }

    return undefined;
  }

  function handleNodeClick(nodeId: NodeId) {
    const piece = game.pieces[nodeId];
    const isHumanTurn = game.turn === game.humanSide && game.winner === null;
    const isTigerPlayer = game.humanSide === 'tiger';

    if (!isHumanTurn) return;

    if (isTigerPlayer && piece === 'tiger' && game.variant === 'standard') {
      selected = nodeId;
      onSelect(nodeId);
      return;
    }

    if (isTigerPlayer && piece === 'goat' && capturableGoats.has(nodeId)) {
      const jumps = legalMoves.filter(
        (candidate) => candidate.kind === 'jump' && candidate.over === nodeId
      );
      if (jumps.length === 1) {
        onMove(jumps[0]);
        return;
      }
      if (selected && game.pieces[selected] === 'tiger') {
        const captureJump = jumps.find((candidate) => moveSource(candidate) === selected);
        if (captureJump) {
          onMove(captureJump);
          return;
        }
      }
    }

    if (game.phase === 'placement' && game.turn === 'goat' && legalTargets.has(nodeId)) {
      const placement = legalMoves.find(
        (candidate) => candidate.kind === 'place' && candidate.to === nodeId
      );
      if (placement) {
        onMove(placement);
      }
      return;
    }

    if (legalTargets.has(nodeId)) {
      const move = findMoveToNode(nodeId);
      if (move) {
        onMove(move);
        return;
      }
    }

    if (isTigerPlayer) {
      if (piece === 'goat') return;
      return;
    }

    if (piece && piece !== game.humanSide) {
      return;
    }

    if (piece && piece === game.humanSide) {
      onSelect(nodeId);
      return;
    }

    onSelect(null);
  }

  function isNodeInteractive(nodeId: NodeId, piece: (typeof game.pieces)[NodeId]): boolean {
    if (game.turn !== game.humanSide || game.winner !== null) return false;

    if (game.humanSide === 'tiger') {
      if (legalTargets.has(nodeId)) return true;
      if (piece === 'goat' && capturableGoats.has(nodeId)) return true;
      if (piece === 'tiger' && game.variant === 'standard') return true;
      return false;
    }

    if (piece === game.humanSide) return true;
    if (legalTargets.has(nodeId)) return true;
    return false;
  }

  function nodeFlags(node: BoardNode) {
    const piece = game.pieces[node.id];
    const isHumanTurn = game.turn === game.humanSide && game.winner === null;
    const isSelected = isHumanTurn && selected === node.id && piece === game.humanSide;
    const isLegal = isHumanTurn && legalTargets.has(node.id);
    const isCaptureLanding = isHumanTurn && captureLandings.has(node.id);
    const isCapturable =
      isHumanTurn && game.humanSide === 'tiger' && piece === 'goat' && capturableGoats.has(node.id);
    const isMovable =
      isHumanTurn &&
      ((game.humanSide === 'goat' && piece === 'goat' && movableGoatNodes.has(node.id)) ||
        (game.humanSide === 'tiger' && piece === 'tiger' && movableTigerNodes.has(node.id)));
    const half = pieceSize / 2;
    const targetRadius = isLegal ? 14 : 8;
    const hitRadius = isLegal ? 28 : piece ? half : 16;

    return {
      piece,
      isSelected,
      isLegal,
      isCaptureLanding,
      isCapturable,
      isMovable,
      half,
      targetRadius,
      hitRadius
    };
  }
</script>

<svg
  {viewBox}
  class="block h-full w-full bg-slate-600"
  preserveAspectRatio="xMidYMid meet"
  role="img"
  aria-label="Bagh-chaal board"
>
  {#each board.edges as [from, to]}
    {@const start = board.nodes[from].coord}
    {@const end = board.nodes[to].coord}
    <line
      x1={start[0]}
      y1={start[1]}
      x2={end[0]}
      y2={end[1]}
      stroke="#1e293b"
      stroke-width="3"
      stroke-linecap="round"
      pointer-events="none"
    />
  {/each}

  {#each backgroundNodes as node (node.id)}
    {@const flags = nodeFlags(node)}
    <g class="pointer-events-none" aria-hidden="true">
      {#if flags.piece}
        <rect
          x={node.coord[0] - flags.half}
          y={node.coord[1] - flags.half}
          width={pieceSize}
          height={pieceSize}
          rx={8}
          fill="transparent"
        />
        <image
          href={pieceImages[flags.piece]}
          x={node.coord[0] - flags.half}
          y={node.coord[1] - flags.half}
          width={pieceSize}
          height={pieceSize}
        />
      {:else}
        <circle
          cx={node.coord[0]}
          cy={node.coord[1]}
          r={flags.targetRadius}
          fill="#cbd5e1"
          stroke="#0f172a"
          stroke-width="2"
        />
      {/if}
    </g>
  {/each}

  {#each interactiveNodes as node (node.id)}
    {@const flags = nodeFlags(node)}
    <g
      class="board-node"
      role="button"
      tabindex="0"
      data-node-id={node.id}
      aria-label="{node.label}{flags.piece ? ` ${flags.piece}` : ''}"
      onclick={() => handleNodeClick(node.id)}
      onkeydown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleNodeClick(node.id);
        }
      }}
    >
      {#if flags.piece}
        <rect
          x={node.coord[0] - flags.half}
          y={node.coord[1] - flags.half}
          width={pieceSize}
          height={pieceSize}
          rx={8}
          fill={flags.isSelected
            ? 'rgba(34, 197, 94, 0.2)'
            : flags.isMovable
              ? 'rgba(34, 197, 94, 0.08)'
              : 'transparent'}
          stroke={flags.isCapturable
            ? '#fb923c'
            : flags.isSelected
              ? '#22c55e'
              : flags.isMovable
                ? '#4ade80'
                : 'transparent'}
          stroke-width={flags.isCapturable ? 4 : flags.isMovable && !flags.isSelected ? 2 : 3}
          stroke-dasharray={flags.isMovable && !flags.isSelected ? '6 4' : undefined}
          class="cursor-pointer"
        />
        <image
          href={pieceImages[flags.piece]}
          x={node.coord[0] - flags.half}
          y={node.coord[1] - flags.half}
          width={pieceSize}
          height={pieceSize}
          pointer-events="none"
        />
      {:else}
        <circle cx={node.coord[0]} cy={node.coord[1]} r={flags.hitRadius} fill="transparent" />
        <circle
          cx={node.coord[0]}
          cy={node.coord[1]}
          r={flags.targetRadius}
          fill={flags.isCaptureLanding ? '#fdba74' : flags.isLegal ? '#86efac' : '#cbd5e1'}
          stroke={flags.isCaptureLanding ? '#ea580c' : '#0f172a'}
          stroke-width={flags.isCaptureLanding ? 3 : 2}
          pointer-events="none"
        />
      {/if}
      <title>{node.label}</title>
    </g>
  {/each}
</svg>
