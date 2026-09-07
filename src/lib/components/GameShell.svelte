<script lang="ts">
  import { onMount } from 'svelte';
  import Board from '$lib/components/Board.svelte';
  import CaptureToast from '$lib/components/CaptureToast.svelte';
  import GameResult from '$lib/components/GameResult.svelte';
  import GameStatus from '$lib/components/GameStatus.svelte';
  import HowToPlay from '$lib/components/HowToPlay.svelte';
  import { getCpuMove } from '$lib/game/cpu';
  import {
    applyMove,
    createGame,
    getLegalMoves,
    isCpuTurn,
    moveSource,
    moveTarget,
    resolveActiveTiger
  } from '$lib/game/engine';
  import { loadSetupPreferences, saveSetupPreferences } from '$lib/game/preferences';
  import {
    getSelectedTigerMoves,
    getStandardTigerLegalMoves,
    resolveStandardTiger
  } from '$lib/game/tiger-ui';
  import type { GameState, Move, NodeId, PlayerSide } from '$lib/game/types';
  import { pieceImages } from '$lib/pieces';

  let selectedVariant = $state<GameState['variant']>('mini');
  let activeVariant = $state<GameState['variant']>('mini');
  let started = $state(false);
  let cpuThinking = $state(false);

  let game = $state(createGame({ variant: 'mini', humanSide: 'goat' }));
  let selected = $state<NodeId | null>(null);
  let lastGoatNode = $state<NodeId | null>(null);
  let lastTigerNode = $state<NodeId | null>(null);
  let humanSide = $state<PlayerSide>('goat');
  let showHowToPlay = $state(false);
  let selectedSide = $state<PlayerSide>('goat');
  let captureNotice = $state<string | null>(null);

  let captureNoticeTimer: ReturnType<typeof window.setTimeout> | undefined;

  const displayVariant = $derived(started ? activeVariant : selectedVariant);
  const variantLabel = $derived(
    displayVariant === 'mini' ? 'Mini board · 1 tiger, 3 goats' : 'Standard board · 5×5'
  );

  const legalMoves = $derived(
    game.turn === humanSide && game.winner === null
      ? humanSide === 'tiger' && game.variant === 'standard'
        ? getStandardTigerLegalMoves(game, selected, lastTigerNode)
        : humanSide === 'tiger'
          ? (() => {
              const tiger = resolveActiveTiger(game, selected);
              return tiger ? getLegalMoves(game).filter((move) => moveSource(move) === tiger) : [];
            })()
          : humanSide === 'goat' && game.phase === 'placement'
            ? getLegalMoves(game)
            : humanSide === 'goat' && game.phase === 'movement'
              ? getLegalMoves(game)
              : []
      : []
  );

  const selectedGoatMoves = $derived(
    selected && humanSide === 'goat' && game.phase === 'movement'
      ? legalMoves.filter((move) => moveSource(move) === selected)
      : []
  );

  const selectedTigerMoves = $derived(
    selected && humanSide === 'tiger' && game.variant === 'standard'
      ? getSelectedTigerMoves(game, selected, lastTigerNode)
      : []
  );

  const goatMoveHint = $derived(
    humanSide === 'goat' &&
      game.turn === humanSide &&
      game.phase === 'movement' &&
      game.winner === null &&
      !cpuThinking
      ? selected && selectedGoatMoves.length === 0
        ? legalMoves.length > 0
          ? 'This goat cannot move — tap a green dot or choose another goat'
          : 'No goat can move'
        : legalMoves.length > 0
          ? 'Tap a green dot to move'
          : null
      : null
  );

  const tigerMoveHint = $derived(
    humanSide === 'tiger' &&
      game.turn === humanSide &&
      game.variant === 'standard' &&
      game.winner === null &&
      !cpuThinking
      ? selected && selectedTigerMoves.length === 0
        ? legalMoves.length > 0
          ? 'This tiger cannot move — tap a green dot or choose another tiger'
          : 'No tiger can move'
        : legalMoves.length > 0
          ? selected && selectedTigerMoves.length > 0
            ? 'Tap a green dot to move, or tap another tiger to switch'
            : 'Tap a tiger with a dashed outline, then tap a green dot'
          : null
      : null
  );

  const moveHint = $derived(goatMoveHint ?? tigerMoveHint);

  function resolveSelection(state: GameState): NodeId | null {
    if (state.winner !== null || state.turn !== humanSide) return null;

    if (humanSide === 'tiger') {
      if (state.variant === 'standard') {
        return resolveStandardTiger(state, selected, lastTigerNode);
      }
      return resolveActiveTiger(state, selected);
    }

    if (humanSide === 'goat' && state.phase === 'movement') {
      const moves = getLegalMoves(state).filter((move) => move.kind === 'move');
      if (lastGoatNode && moves.some((move) => moveSource(move) === lastGoatNode)) {
        return lastGoatNode;
      }
      const firstMovable = moves.map((move) => moveSource(move)).find((node) => node !== null);
      if (firstMovable) return firstMovable;
    }

    return null;
  }

  function syncSelection(state: GameState) {
    if (state.turn !== humanSide || state.winner !== null) {
      selected = null;
      return;
    }

    if (humanSide === 'tiger' && state.variant === 'standard') {
      selected = resolveSelection(state);
      return;
    }

    selected = applySelection(state);
  }

  function applySelection(state: GameState): NodeId | null {
    const next = resolveSelection(state);
    if (next && humanSide === 'goat' && state.pieces[next] === 'goat') {
      lastGoatNode = next;
    }
    return next;
  }

  function rememberGoatSelection(node: NodeId | null) {
    if (node && game.pieces[node] === 'goat') {
      lastGoatNode = node;
    }
  }

  function clearCaptureNotice() {
    if (captureNoticeTimer) {
      window.clearTimeout(captureNoticeTimer);
      captureNoticeTimer = undefined;
    }
    captureNotice = null;
  }

  function notifyCapture(previous: GameState, next: GameState) {
    if (next.captures <= previous.captures) return;

    captureNotice =
      humanSide === 'tiger'
        ? `Goat captured! (${next.captures} total)`
        : `Tiger captured a goat (${next.captures} total)`;

    if (captureNoticeTimer) {
      window.clearTimeout(captureNoticeTimer);
    }
    captureNoticeTimer = window.setTimeout(() => {
      captureNotice = null;
      captureNoticeTimer = undefined;
    }, 2000);
  }

  function persistSetup() {
    saveSetupPreferences({ variant: selectedVariant, side: selectedSide });
  }

  onMount(() => {
    const prefs = loadSetupPreferences();
    if (prefs) {
      selectedVariant = prefs.variant;
      selectedSide = prefs.side;
    }
  });

  function startGame() {
    activeVariant = selectedVariant;
    humanSide = selectedSide;
    lastGoatNode = null;
    lastTigerNode = null;
    cpuThinking = false;
    clearCaptureNotice();
    persistSetup();
    game = createGame({ variant: activeVariant, humanSide: selectedSide });
    syncSelection(game);
    started = true;
    maybeRunCpu();
  }

  function playAgain() {
    started = false;
    selected = null;
    lastGoatNode = null;
    lastTigerNode = null;
    cpuThinking = false;
    clearCaptureNotice();
    selectedVariant = activeVariant;
    game = createGame({ variant: activeVariant, humanSide: selectedSide });
  }

  function handleMove(move: Move) {
    if (humanSide === 'goat' && move.kind === 'move') {
      lastGoatNode = moveTarget(move);
    }
    if (humanSide === 'tiger' && (move.kind === 'move' || move.kind === 'jump')) {
      lastTigerNode = moveTarget(move);
    }
    const previous = game;
    game = applyMove(game, move);
    notifyCapture(previous, game);
    if (game.turn !== humanSide) {
      selected = null;
    }
    maybeRunCpu();
  }

  function maybeRunCpu() {
    if (isCpuTurn(game)) {
      cpuThinking = true;
      window.setTimeout(() => {
        const previous = game;
        const cpuMove = getCpuMove(game);
        if (cpuMove) {
          game = applyMove(game, cpuMove);
          notifyCapture(previous, game);
        }
        cpuThinking = false;
        syncSelection(game);
      }, 400);
    }
  }

  function handleSelect(node: NodeId | null) {
    if (humanSide === 'tiger') {
      if (activeVariant === 'mini') return;
      if (node === null) {
        selected = null;
        return;
      }
      if (game.turn !== humanSide || game.pieces[node] !== 'tiger') return;
      selected = node;
      lastTigerNode = node;
      return;
    }

    if (node === null) {
      selected = null;
      return;
    }
    if (game.turn !== humanSide || game.pieces[node] !== humanSide) return;
    selected = node;
    rememberGoatSelection(node);
  }
</script>

<div
  class="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl"
>
  {#if !started}
    <section class="px-6 py-8 text-center text-slate-100 sm:px-8">
      <h1 class="text-4xl font-bold tracking-tight">Bagh-chaal</h1>
      <p class="mt-2 text-base font-medium text-slate-300">{variantLabel}</p>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
        Trap the tiger or capture the goats.
      </p>

      <div class="mt-8 flex justify-center gap-8">
        <img src={pieceImages.tiger} alt="" class="h-16 w-16 drop-shadow-lg" />
        <span class="self-center text-2xl text-slate-600">vs</span>
        <img src={pieceImages.goat} alt="" class="h-16 w-16 drop-shadow-lg" />
      </div>

      <fieldset class="mx-auto mt-8 max-w-xs">
        <legend class="mb-3 text-sm font-medium text-slate-300">Board</legend>
        <div class="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-1">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition ring-1 ring-inset"
            class:bg-sky-600={selectedVariant === 'mini'}
            class:text-white={selectedVariant === 'mini'}
            class:ring-sky-500={selectedVariant === 'mini'}
            class:bg-slate-800={selectedVariant !== 'mini'}
            class:text-slate-200={selectedVariant !== 'mini'}
            class:ring-slate-600={selectedVariant !== 'mini'}
            onclick={() => {
              selectedVariant = 'mini';
              persistSetup();
            }}
          >
            Mini
          </button>
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition ring-1 ring-inset"
            class:bg-sky-600={selectedVariant === 'standard'}
            class:text-white={selectedVariant === 'standard'}
            class:ring-sky-500={selectedVariant === 'standard'}
            class:bg-slate-800={selectedVariant !== 'standard'}
            class:text-slate-200={selectedVariant !== 'standard'}
            class:ring-slate-600={selectedVariant !== 'standard'}
            onclick={() => {
              selectedVariant = 'standard';
              persistSetup();
            }}
          >
            Standard
          </button>
        </div>
      </fieldset>

      <fieldset class="mx-auto mt-6 max-w-xs">
        <legend class="mb-3 text-sm font-medium text-slate-300">Play as</legend>
        <div class="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/60 p-1">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition ring-1 ring-inset"
            class:bg-sky-600={selectedSide === 'tiger'}
            class:text-white={selectedSide === 'tiger'}
            class:ring-sky-500={selectedSide === 'tiger'}
            class:bg-slate-800={selectedSide !== 'tiger'}
            class:text-slate-200={selectedSide !== 'tiger'}
            class:ring-slate-600={selectedSide !== 'tiger'}
            onclick={() => {
              selectedSide = 'tiger';
              persistSetup();
            }}
          >
            Tiger
          </button>
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold transition ring-1 ring-inset"
            class:bg-sky-600={selectedSide === 'goat'}
            class:text-white={selectedSide === 'goat'}
            class:ring-sky-500={selectedSide === 'goat'}
            class:bg-slate-800={selectedSide !== 'goat'}
            class:text-slate-200={selectedSide !== 'goat'}
            class:ring-slate-600={selectedSide !== 'goat'}
            onclick={() => {
              selectedSide = 'goat';
              persistSetup();
            }}
          >
            Goats
          </button>
        </div>
      </fieldset>

      <button
        type="button"
        class="mt-6 w-full max-w-xs rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
        onclick={startGame}
      >
        Start game
      </button>

      <p class="mt-4 text-sm text-slate-500">
        <button
          type="button"
          class="text-slate-300 underline-offset-2 hover:text-white hover:underline"
          onclick={() => (showHowToPlay = true)}
        >
          How to play
        </button>
      </p>
    </section>
  {:else}
    <div class="p-4">
      <GameStatus {game} {variantLabel} {cpuThinking} hint={moveHint} />

      <div
        class="relative mt-4 aspect-square w-full overflow-hidden rounded-lg border border-slate-700"
      >
        <CaptureToast message={captureNotice} />
        <Board
          bind:selected
          {game}
          {legalMoves}
          movableGoatNodes={humanSide === 'goat' && game.phase === 'movement'
            ? new Set(
                legalMoves
                  .filter((move) => move.kind === 'move')
                  .map((move) => moveSource(move))
                  .filter((node): node is NodeId => node !== null)
              )
            : new Set()}
          movableTigerNodes={humanSide === 'tiger' && game.variant === 'standard'
            ? new Set(
                getLegalMoves(game)
                  .map((move) => moveSource(move))
                  .filter((node): node is NodeId => node !== null)
              )
            : new Set()}
          onSelect={handleSelect}
          onMove={handleMove}
        />
        {#if game.winner}
          <GameResult {game} onPlayAgain={playAgain} />
        {/if}
      </div>

      <div class="mt-4 flex flex-col items-center gap-3">
        {#if !game.winner}
          <button
            type="button"
            class="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
            onclick={playAgain}
          >
            End game
          </button>
        {/if}
        <button
          type="button"
          class="text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          onclick={() => (showHowToPlay = true)}
        >
          How to play
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showHowToPlay}
  <HowToPlay onDismiss={() => (showHowToPlay = false)} />
{/if}
