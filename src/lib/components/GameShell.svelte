<script lang="ts">
  import { onMount } from 'svelte';
  import Board from '$lib/components/Board.svelte';
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
  import type { GameState, Move, NodeId, PlayerSide } from '$lib/game/types';
  import { pieceImages } from '$lib/pieces';

  let selectedVariant: GameState['variant'] = 'mini';
  let activeVariant: GameState['variant'] = 'mini';
  let started = false;
  let cpuThinking = false;

  $: displayVariant = started ? activeVariant : selectedVariant;
  $: variantLabel =
    displayVariant === 'mini' ? 'Mini board · 1 tiger, 3 goats' : 'Standard board · 5×5';

  let game = createGame({ variant: 'mini', humanSide: 'goat' });
  let selectedSide: PlayerSide = 'goat';
  let selected: NodeId | null = null;
  let lastGoatNode: NodeId | null = null;
  let humanSide: PlayerSide = 'goat';
  let showHowToPlay = false;

  $: activeTiger =
    game.turn === humanSide && humanSide === 'tiger' ? resolveActiveTiger(game, selected) : null;

  $: legalMoves =
    game.turn === humanSide && game.winner === null
      ? humanSide === 'tiger' && activeTiger
        ? getLegalMoves(game).filter((move) => moveSource(move) === activeTiger)
        : selected && humanSide === 'goat'
          ? getLegalMoves(game).filter((move) => moveSource(move) === selected)
          : game.phase === 'placement' && humanSide === 'goat'
            ? getLegalMoves(game)
            : []
      : [];

  function resolveSelection(state: GameState): NodeId | null {
    if (state.winner !== null || state.turn !== humanSide) return null;

    if (humanSide === 'tiger') {
      return resolveActiveTiger(state, selected);
    }

    if (humanSide === 'goat' && state.phase === 'movement') {
      if (lastGoatNode && state.pieces[lastGoatNode] === 'goat') return lastGoatNode;
      if (activeVariant === 'mini' && state.pieces.i === 'goat') return 'i';
    }

    return null;
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
    cpuThinking = false;
    persistSetup();
    game = createGame({ variant: activeVariant, humanSide: selectedSide });
    selected = applySelection(game);
    started = true;
    maybeRunCpu();
  }

  function playAgain() {
    started = false;
    selected = null;
    lastGoatNode = null;
    cpuThinking = false;
    selectedVariant = activeVariant;
    game = createGame({ variant: activeVariant, humanSide: selectedSide });
  }

  function handleMove(move: Move) {
    if (humanSide === 'goat' && move.kind === 'move') {
      lastGoatNode = moveTarget(move);
    }
    game = applyMove(game, move);
    selected = applySelection(game);
    maybeRunCpu();
  }

  function maybeRunCpu() {
    if (isCpuTurn(game)) {
      cpuThinking = true;
      window.setTimeout(() => {
        const cpuMove = getCpuMove(game);
        if (cpuMove) {
          game = applyMove(game, cpuMove);
        }
        cpuThinking = false;
        selected = applySelection(game);
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
            on:click={() => {
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
            on:click={() => {
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
            on:click={() => {
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
            on:click={() => {
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
        on:click={startGame}
      >
        Start game
      </button>

      <p class="mt-4 text-sm text-slate-500">
        <button
          type="button"
          class="text-slate-300 underline-offset-2 hover:text-white hover:underline"
          on:click={() => (showHowToPlay = true)}
        >
          How to play
        </button>
      </p>
    </section>
  {:else}
    <div class="p-4">
      <GameStatus {game} {variantLabel} {cpuThinking} />

      <div
        class="relative mt-4 aspect-square w-full overflow-hidden rounded-lg border border-slate-700"
      >
        <Board
          {game}
          {legalMoves}
          selected={activeTiger ?? selected}
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
            on:click={playAgain}
          >
            End game
          </button>
        {/if}
        <button
          type="button"
          class="text-sm text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
          on:click={() => (showHowToPlay = true)}
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
