<script>
  import { onMount } from 'svelte';

  let canvas;
  export let width = 500;
  export let height = 500;

  let a = [width / 2, 50];
  let b = [width / 2 - 75, 150];
  let c = [width / 2, 150];
  let d = [width / 2 + 75, 150];
  let e = [width / 2 - 150, height / 2];
  let f = [width / 2, 250];
  let g = [width / 2 + 150, height / 2];
  let h = [width / 2 - 150, 400];
  let i = [width / 2, 400];
  let j = [width / 2 + 150, 400];

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
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
  }
</script>

<div class="bg-slate-600 text-center text-gray-800 pt-5 pb-0">
  <p class="text-4xl font-bold font-sans">Baghchal</p>
  <p class="text-xl font-bold font-sans">A Tiger's move</p>
</div>

<div class="bg-slate-500">
  <canvas {width} {height} bind:this={canvas} />
</div>

<div class="flex flex-row justify-center items-center bg-slate-600 ">

  <div class="m-5">
    <p class="text-lg text-gray-800 font-bold">Play as:</p>

    <div class="form-check">
      <input
        class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
        type="radio" name="playAs" id="playAsTiger">
      <label class="form-check-label text-gray-800" for="playAs1">
        Tiger
      </label>
    </div>

    <div class="form-check">
      <input
        class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
        type="radio" name="playAs" id="playAsGoat" checked>
      <label class="form-check-label inline-block text-gray-800" for="playAs2">
        Goat
      </label>
    </div>

  </div>

  <button class="m-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
    New Game
  </button>

  <p class="m-5 text-lg text-center text-gray-800 font-bold">Tiger Wins</p>
</div>
