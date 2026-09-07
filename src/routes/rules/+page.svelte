<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import HowToPlay from '$lib/components/HowToPlay.svelte';

  function dismiss() {
    void goto(`${base}/`);
  }
</script>

<svelte:head>
  <title>Rules — Bagh-chaal</title>
</svelte:head>

<HowToPlay onDismiss={dismiss} overlay={false} />
