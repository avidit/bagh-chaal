<script lang="ts">
  import '../app.css';
</script>

<svelte:head>
  <title>Bagh-chaal</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
  <main class="mx-auto flex min-h-screen max-w-xl items-center px-4 py-6">
    <div class="w-full">
      <slot />
    </div>
  </main>
</div>
