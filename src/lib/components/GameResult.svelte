<script lang="ts">
  import { getWinSummary } from '$lib/game/engine';
  import type { GameState } from '$lib/game/types';
  import { pieceImages } from '$lib/pieces';

  export let game: GameState;
  export let onPlayAgain: () => void = () => {};

  $: summary = getWinSummary(game);
  $: winnerImage = summary?.winner === 'tiger' ? pieceImages.tiger : pieceImages.goat;
  $: winnerLabel = summary?.winner === 'tiger' ? 'Tiger' : 'Goats';
  $: panelClass = summary?.humanWon
    ? 'border-emerald-500/40 bg-emerald-950/90'
    : 'border-orange-500/40 bg-slate-900/95';
  $: titleClass = summary?.humanWon ? 'text-emerald-300' : 'text-orange-300';
  $: buttonClass = summary?.humanWon
    ? 'bg-emerald-600 hover:bg-emerald-500'
    : 'bg-orange-600 hover:bg-orange-500';
</script>

{#if summary}
  <div
    class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-950/75 p-4 backdrop-blur-sm"
    role="status"
    aria-live="assertive"
  >
    <div class="w-full max-w-xs rounded-2xl border px-6 py-6 text-center shadow-2xl {panelClass}">
      <img src={winnerImage} alt="" class="mx-auto h-16 w-16 drop-shadow-lg" aria-hidden="true" />

      <p class="mt-4 text-2xl font-bold tracking-tight {titleClass}">
        {summary.title}
      </p>

      <p class="mt-1 text-sm text-slate-300">{summary.subtitle}</p>

      <p class="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
        {winnerLabel} win
      </p>

      <div class="mt-4 flex justify-center gap-4 text-sm text-slate-400">
        <span>Captured <strong class="text-slate-200">{game.captures}</strong></span>
        <span>Goats left <strong class="text-slate-200">{game.goatsRemaining}</strong></span>
      </div>

      <button
        type="button"
        class="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition {buttonClass}"
        onclick={onPlayAgain}
      >
        Play again
      </button>
    </div>
  </div>
{/if}
