<script lang="ts">
  import { getWinSummary } from '$lib/game/engine';
  import type { GameState } from '$lib/game/types';

  export let game: GameState;
  export let variantLabel: string;
  export let cpuThinking = false;
  export let hint: string | null = null;

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
    {#if game.variant === 'mini'}
      <span>On board <strong class="text-white">{game.goatsOnBoard}</strong></span>
    {:else}
      <span>Goats left <strong class="text-white">{game.goatsRemaining}</strong></span>
    {/if}
    <span>Captured <strong class="text-white">{game.captures}</strong></span>
    {#if game.variant === 'standard' && game.phase === 'placement'}
      <span>To place <strong class="text-white">{game.goatsToPlace}</strong></span>
    {/if}
  </div>
  <p class="mt-2 min-h-10 text-xs leading-5 text-amber-200" aria-hidden={!hint}>
    {hint ?? ''}
  </p>
</div>
