<script lang="ts">
  import { getWinSummary } from '$lib/game/engine';
  import type { GameState } from '$lib/game/types';

  export let game: GameState;
  export let variantLabel: string;
  export let cpuThinking = false;

  $: cpuSide = game.humanSide === 'tiger' ? 'Goats' : 'Tiger';
  $: winSummary = getWinSummary(game);

  $: turnLabel = winSummary
    ? winSummary.title
    : cpuThinking
      ? `${cpuSide} thinking…`
      : game.turn === 'tiger'
        ? "Tiger's turn"
        : game.phase === 'placement'
          ? 'Place a goat'
          : "Goats' turn";

  $: roleLabel = game.humanSide === 'tiger' ? 'Tiger' : 'Goats';
</script>

<div
  class="rounded-lg bg-slate-900/60 px-4 py-3 text-center text-slate-100"
  aria-live="polite"
  aria-atomic="true"
>
  <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{variantLabel}</p>
  <p
    class="mt-1 text-lg font-semibold"
    class:text-emerald-300={winSummary?.humanWon}
    class:text-orange-300={winSummary && !winSummary.humanWon}
    class:text-sky-300={cpuThinking && !winSummary}
  >
    {turnLabel}
  </p>
  <p class="mt-0.5 text-xs text-slate-400">
    {#if winSummary}
      {winSummary.subtitle}
    {:else}
      Playing as {roleLabel}
    {/if}
  </p>
  <div class="mt-3 flex justify-center gap-5 text-sm text-slate-300">
    <span>Goats left <strong class="text-white">{game.goatsRemaining}</strong></span>
    <span>Captured <strong class="text-white">{game.captures}</strong></span>
    {#if game.variant === 'standard' && game.phase === 'placement'}
      <span>To place <strong class="text-white">{game.goatsToPlace}</strong></span>
    {/if}
  </div>
</div>
