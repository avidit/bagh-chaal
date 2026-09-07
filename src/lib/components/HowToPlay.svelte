<script lang="ts">
  import { onMount } from 'svelte';

  export let onDismiss: () => void;
  /** When true, renders as a modal overlay; when false, inline panel (e.g. /rules route). */
  export let overlay = true;

  const boardDiagram = String.raw`
      A
     /|\
    / | \
   B--C--D
  /       \
 /         \
E-----F-----G
      |
      |
      |
H-----I-----J`;

  const standardBoardDiagram = String.raw`T---o---o---o---T
|\|/|\|/|\|/|\|/|
|/|\|/|\|/|\|/|\|
o---o---o---o---o
|\|/|\|/|\|/|\|/|
|/|\|/|\|/|\|/|\|
o---o---o---o---o
|\|/|\|/|\|/|\|/|
|/|\|/|\|/|\|/|\|
o---o---o---o---o
|\|/|\|/|\|/|\|/|
|/|\|/|\|/|\|/|\|
T---o---o---o---T`;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onDismiss();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#snippet panel(panelClass: string)}
  <div
    class="{panelClass} relative max-w-4xl rounded-2xl border border-slate-700 bg-slate-800 p-5 text-slate-100 shadow-2xl sm:p-6"
    role="dialog"
    aria-modal={overlay ? 'true' : undefined}
    aria-labelledby="how-to-play-title"
  >
    <button
      type="button"
      class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-slate-400 transition hover:bg-slate-700 hover:text-white"
      aria-label="Close"
      onclick={onDismiss}
    >
      ×
    </button>

    <h1 id="how-to-play-title" class="pr-10 text-2xl font-bold">How to play</h1>
    <p class="mt-1 text-sm leading-relaxed text-slate-400">
      Bagh-chaal (“A Tiger's move”) — one side plays tigers, the other goats. Tigers capture by
      jumping; goats win by trapping all tigers.
    </p>

    <ul class="mt-3 list-disc space-y-0.5 pl-5 text-sm text-slate-300">
      <li>Pieces move along lines to adjacent empty points.</li>
      <li>Tigers may jump over a goat to capture it (goat removed).</li>
    </ul>

    <div class="mt-5 grid gap-5 md:grid-cols-2">
      <section class="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <h2 class="text-lg font-semibold">Mini board</h2>
        <p class="mt-0.5 text-xs text-slate-400">1 tiger · 3 goats</p>
        <div class="mt-2 flex justify-center">
          <pre class="ascii-diagram ascii-diagram-sm">{boardDiagram}</pre>
        </div>
        <ul class="mt-2 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-slate-300">
          <li>
            Tiger at <strong class="text-slate-100">A</strong>; goats at
            <strong class="text-slate-100">H</strong>, <strong class="text-slate-100">I</strong>,
            <strong class="text-slate-100">J</strong>.
          </li>
          <li>
            No edge between <strong class="text-slate-100">E↔H</strong> or
            <strong class="text-slate-100">G↔J</strong>.
          </li>
          <li>Tiger wins after 2 captures; goats win if the tiger is trapped.</li>
        </ul>
      </section>

      <section class="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <h2 class="text-lg font-semibold">Standard 5×5</h2>
        <p class="mt-0.5 text-xs text-slate-400">4 tigers · 20 goats</p>
        <div class="mt-2 flex justify-center">
          <pre class="ascii-diagram ascii-diagram-sm">{standardBoardDiagram}</pre>
        </div>
        <ul class="mt-2 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-slate-300">
          <li>
            Tigers (<strong class="text-slate-100">T</strong>) start on corners; goats are placed
            one at a time, then moved.
          </li>
          <li>Tiger wins after 5 captures; goats win when all four tigers are trapped.</li>
          <li>Draw if the same position occurs three times.</li>
        </ul>
      </section>
    </div>
  </div>
{/snippet}

{#if overlay}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    role="presentation"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Close how to play"
      onclick={onDismiss}
    ></button>
    {@render panel('max-h-[90vh] w-full overflow-y-auto')}
  </div>
{:else}
  {@render panel('mx-auto')}
{/if}
