<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  interface Props {
    message: string | null;
  }

  let { message }: Props = $props();
</script>

{#if message}
  <div
    class="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4"
    role="status"
    aria-live="polite"
    transition:fly={{ y: -8, duration: 180 }}
  >
    <p
      class="rounded-full border border-orange-500/50 bg-orange-950/95 px-4 py-2 text-sm font-semibold text-orange-100 shadow-lg"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 150 }}
    >
      {message}
    </p>
  </div>
{/if}
