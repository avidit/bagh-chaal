<script>
  import { onMount } from 'svelte';

  let canvas;
  export let canvasWidth = 500;
  export let canvasHeight = 500;

  let charWidth = 50;
  let charHeight = 50;

  let a = [canvasWidth / 2, 50];
  let b = [canvasWidth / 2 - 75, 150];
  let c = [canvasWidth / 2, 150];
  let d = [canvasWidth / 2 + 75, 150];
  let e = [canvasWidth / 2 - 150, canvasHeight / 2];
  let f = [canvasWidth / 2, 250];
  let g = [canvasWidth / 2 + 150, canvasHeight / 2];
  let h = [canvasWidth / 2 - 150, 400];
  let i = [canvasWidth / 2, 400];
  let j = [canvasWidth / 2 + 150, 400];

  let turn = 'Goat';
  let playAs;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
    updateBoard(ctx, a, [h, i, j]);
    highightPositon(ctx, i);
  });

  const drawLine = (ctx, start, end) => {
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
  };

  const drawCharacter = (ctx, src, position) => {
    let [x, y] = position;
    let image = new Image();
    image.src = src;
    image.onload = () =>
      ctx.drawImage(image, x - charWidth / 2, y - charHeight / 2, charWidth, charHeight);
  };

  const drawTiger = (ctx, position) => drawCharacter(ctx, 'tiger.png', position);
  const drawGoat = (ctx, position) => drawCharacter(ctx, 'goat.png', position);

  const drawBoard = (ctx) => {
    const options = { lineCap: 'round', lineJoin: 'round', lineWidth: 3 };
    Object.assign(ctx, options);
    drawLine(ctx, a, e);
    drawLine(ctx, a, c);
    drawLine(ctx, a, g);
    drawLine(ctx, b, d);
    drawLine(ctx, e, g);
    drawLine(ctx, f, i);
    drawLine(ctx, h, j);
  };

  const updateBoard = (ctx, tiger = a, goats = [h, i, j]) => {
    drawBoard(ctx);
    drawTiger(ctx, tiger);
    goats.forEach((goat) => drawGoat(ctx, goat));
  };

  const highightPositon = (ctx, position) => {
    const options = { lineWidth: 2, strokeStyle: '#16a34a' }
    Object.assign(ctx, options);
    let [x, y] = position;
    ctx.beginPath();
    ctx.rect(x - charWidth / 2, y - charHeight / 2, charWidth, charHeight);
    ctx.stroke();
  };

  const moveChar = (ctx, to) => {
    ctx.clearRect(0, 0, canvas.canvasWidth, canvas.height);
    drawBoard(ctx, to);
  };

  const isEmpty = (ctx, position) => {
    return true;
  };

  const canMove = (ctx, from, to) => {
    isEmpty(to) ? true : false;
  };

  const canCapture = (ctx, from, to) => {
    return true;
  };
</script>

<div class="container flex justify-center">
  <div class="box-border border-slate-800 border-8 rounded-md">
    <div class="bg-slate-600 text-center text-gray-800 pt-5 pb-0">
      <p class="text-4xl font-bold font-sans">Baghchal</p>
      <p class="text-xl font-bold font-sans">A Tiger's move</p>
    </div>

    <div class="bg-slate-500">
      <canvas width={canvasWidth} height={canvasHeight} bind:this={canvas} />
    </div>

    <div class="flex flex-row justify-center items-center bg-slate-600 ">
      <div class="m-5">
        <p class="text-lg text-gray-800 font-bold">Play as:</p>
        <div class="form-check">
          <input
            class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
            type="radio"
            name="playAs"
            id="playAsTiger"
          />
          <label class="form-check-label text-gray-800" for="playAsTiger"> Tiger </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
            type="radio"
            name="playAs"
            id="playAsGoat"
            checked
          />
          <label class="form-check-label inline-block text-gray-800" for="playAsGoat"> Goat </label>
        </div>
      </div>

      <button class="m-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
        New Game
      </button>

      <p class="m-5 text-lg text-center text-gray-800 font-bold">Turn: {turn}</p>
    </div>
  </div>
</div>
