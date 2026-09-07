<script lang="ts">
  import '../app.css';
  import { appVersion } from '$lib/version';
</script>

<svelte:head>
  <title>Bagh-chaal</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
  <main class="mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-6">
    <div class="w-full">
      <slot />
    </div>
  </main>
  <footer class="pb-4 text-center text-xs text-slate-600">v{appVersion}</footer>
</div>
