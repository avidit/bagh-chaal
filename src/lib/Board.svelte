<script>
  import { onMount } from 'svelte';
  let canvas;
  export let width = 800;
  export let height = 800;
  let a = [width / 2, 100];
  let b = [width / 2 - 100, 250];
  let c = [width / 2, 250];
  let d = [width / 2 + 100, 250];
  let e = [width / 2 - 200, height / 2];
  let f = [width / 2, 400];
  let g = [width / 2 + 200, height / 2];
  let h = [width / 2 - 200, 600];
  let i = [width / 2, 600];
  let j = [width / 2 + 200, 600];

  onMount(() => {
    const ctx = canvas.getContext('2d');
    drawLine(ctx, a, e);
    drawLine(ctx, a, c);
    drawLine(ctx, a, g);
    drawLine(ctx, b, d);
    drawLine(ctx, e, g);
    drawLine(ctx, f, i);
    drawLine(ctx, h, j);
  });

  function drawLine(ctx, start, end) {
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
  }
</script>

<canvas {width} {height} bind:this={canvas} />

<style>
  canvas {
    background-color: #666666;
  }
</style>
