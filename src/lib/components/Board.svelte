<script lang="ts">
  import { getBoard, moveTarget } from '$lib/game/engine';
  import type { GameState, Move, NodeId } from '$lib/game/types';
  import { pieceImages } from '$lib/pieces';

  export let game: GameState;
  export let legalMoves: Move[] = [];
  export let selected: NodeId | null = null;
  export let onSelect: (node: NodeId | null) => void = () => {};
  export let onMove: (move: Move) => void = () => {};

  $: board = getBoard(game.variant);
  $: pieceSize = game.variant === 'mini' ? 50 : 36;
  $: viewBox = (() => {
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
  })();

  $: legalTargets = new Set(legalMoves.map((move) => moveTarget(move)));
  $: captureJumps = legalMoves.filter((move) => move.kind === 'jump');
  $: captureLandings = new Set(captureJumps.map((move) => moveTarget(move)));
  $: capturableGoats = new Set(captureJumps.map((move) => move.over));
  $: nodeList = Object.values(board.nodes);

  function handleNodeClick(nodeId: NodeId) {
    const piece = game.pieces[nodeId];
    const isHumanTurn = game.turn === game.humanSide && game.winner === null;
    const isTigerPlayer = game.humanSide === 'tiger';

    if (!isHumanTurn) return;

    if (selected && isHumanTurn) {
      const move = legalMoves.find((candidate) => moveTarget(candidate) === nodeId);
      if (move) {
        onMove(move);
        return;
      }

      if (isTigerPlayer && piece === 'goat' && game.pieces[selected] === 'tiger') {
        const captureJump = legalMoves.find(
          (candidate) => candidate.kind === 'jump' && candidate.over === nodeId
        );
        if (captureJump) {
          onMove(captureJump);
          return;
        }
      }
    }

    if (isTigerPlayer) {
      if (piece === 'goat') return;
      if (piece === 'tiger' && game.variant === 'standard') {
        onSelect(nodeId);
      }
      return;
    }

    if (piece && piece !== game.humanSide) {
      return;
    }

    if (piece && piece === game.humanSide) {
      onSelect(nodeId);
      return;
    }

    if (game.phase === 'placement' && legalTargets.has(nodeId)) {
      const placement = legalMoves.find(
        (candidate) => candidate.kind === 'place' && candidate.to === nodeId
      );
      if (placement) {
        onMove(placement);
      }
      return;
    }

    if (legalTargets.has(nodeId)) {
      const move = legalMoves.find((candidate) => moveTarget(candidate) === nodeId);
      if (move) {
        onMove(move);
      }
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
    />
  {/each}

  {#each nodeList as node}
    {@const piece = game.pieces[node.id]}
    {@const isHumanTurn = game.turn === game.humanSide && game.winner === null}
    {@const isSelected = isHumanTurn && selected === node.id && piece === game.humanSide}
    {@const isLegal = isHumanTurn && legalTargets.has(node.id)}
    {@const isCaptureLanding = isHumanTurn && captureLandings.has(node.id)}
    {@const isCapturable =
      isHumanTurn && game.humanSide === 'tiger' && piece === 'goat' && capturableGoats.has(node.id)}
    {@const interactive = isNodeInteractive(node.id, piece)}
    {@const half = pieceSize / 2}
    {#if interactive}
      <g
        role="button"
        tabindex="0"
        aria-label="{node.label}{piece ? ` ${piece}` : ''}"
        onclick={() => handleNodeClick(node.id)}
        onkeydown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNodeClick(node.id);
          }
        }}
      >
        {#if piece}
          <rect
            x={node.coord[0] - half}
            y={node.coord[1] - half}
            width={pieceSize}
            height={pieceSize}
            rx={8}
            fill={isSelected ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
            stroke={isCapturable ? '#fb923c' : isSelected ? '#22c55e' : 'transparent'}
            stroke-width={isCapturable ? 4 : 3}
            class="cursor-pointer"
          />
          <image
            href={pieceImages[piece]}
            x={node.coord[0] - half}
            y={node.coord[1] - half}
            width={pieceSize}
            height={pieceSize}
            pointer-events="none"
          />
        {:else}
          <circle
            cx={node.coord[0]}
            cy={node.coord[1]}
            r={isLegal ? 12 : 8}
            fill={isCaptureLanding ? '#fdba74' : isLegal ? '#86efac' : '#cbd5e1'}
            stroke={isCaptureLanding ? '#ea580c' : '#0f172a'}
            stroke-width={isCaptureLanding ? 3 : 2}
            class="cursor-pointer"
          />
        {/if}
        <title>{node.label}</title>
      </g>
    {:else}
      <g aria-hidden="true">
        {#if piece}
          <rect
            x={node.coord[0] - half}
            y={node.coord[1] - half}
            width={pieceSize}
            height={pieceSize}
            rx={8}
            fill={isSelected ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
            stroke={isCapturable ? '#fb923c' : isSelected ? '#22c55e' : 'transparent'}
            stroke-width={isCapturable ? 4 : 3}
            class="cursor-default"
          />
          <image
            href={pieceImages[piece]}
            x={node.coord[0] - half}
            y={node.coord[1] - half}
            width={pieceSize}
            height={pieceSize}
            pointer-events="none"
          />
        {:else}
          <circle
            cx={node.coord[0]}
            cy={node.coord[1]}
            r={isLegal ? 12 : 8}
            fill={isCaptureLanding ? '#fdba74' : isLegal ? '#86efac' : '#cbd5e1'}
            stroke={isCaptureLanding ? '#ea580c' : '#0f172a'}
            stroke-width={isCaptureLanding ? 3 : 2}
            class="cursor-default"
          />
        {/if}
        <title>{node.label}</title>
      </g>
    {/if}
  {/each}
</svg>
