<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;

  export let canvasWidth = 500;
  export let canvasHeight = 500;

  let charWidth = 50;
  let charHeight = 50;

  let board = {
    a: { id: 'a', coord: [canvasWidth / 2, 50], paths: ['b', 'c', 'd'], jumpPaths: ['e', 'g'] },
    b: { id: 'b', coord: [canvasWidth / 2 - 75, 150], paths: ['a', 'c', 'e'], jumpPaths: [] },
    c: { id: 'c', coord: [canvasWidth / 2, 150], paths: ['a', 'b', 'd'], jumpPaths: [] },
    d: { id: 'd', coord: [canvasWidth / 2 + 75, 150], paths: ['a', 'c', 'g'], jumpPaths: [] },
    e: { id: 'e', coord: [canvasWidth / 2 - 150, canvasHeight / 2], paths: ['b', 'f'], jumpPaths: ['g'] },
    f: { id: 'f', coord: [canvasWidth / 2, 250], paths: ['e', 'g', 'i'], jumpPaths: [] },
    g: { id: 'g', coord: [canvasWidth / 2 + 150, canvasHeight / 2], paths: ['d', 'f'], jumpPaths: ['e'] },
    h: { id: 'h', coord: [canvasWidth / 2 - 150, 400], paths: ['i'], jumpPaths: ['j'] },
    i: { id: 'i', coord: [canvasWidth / 2, 400], paths: ['f', 'h', 'j'], jumpPaths: [] },
    j: { id: 'j', coord: [canvasWidth / 2 + 150, 400], paths: ['i'], jumpPaths: ['h'] }
  };

  let m = { x: 0, y: 0 };

  onMount(() => {
    ctx = canvas.getContext('2d');
    drawBoard();
    newGame();
  });

  const drawLine = (start, end) => {
    ctx.beginPath();
    ctx.moveTo(...start.coord);
    ctx.lineTo(...end.coord);
    ctx.stroke();
  };

  const drawCharacter = (position) => {
    let [x, y] = board[position].coord;
    let image = new Image();
    image.src = `${board[position].char}.png`;
    image.onload = () =>
      ctx.drawImage(image, x - charWidth / 2, y - charHeight / 2, charWidth, charHeight);
  };

  const drawBoard = () => {
    const options = { lineCap: 'round', lineJoin: 'round', lineWidth: 3, strokeStyle: '#000000' };
    Object.assign(ctx, options);
    drawLine(board.a, board.e);
    drawLine(board.a, board.c);
    drawLine(board.a, board.g);
    drawLine(board.b, board.d);
    drawLine(board.e, board.g);
    drawLine(board.f, board.i);
    drawLine(board.h, board.j);
  };

  const clearBoard = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  };

  const updateBoard = () => {
    drawBoard(ctx);
    for (const [k, v] of Object.entries(board)) {
      if (v.char) {
        drawCharacter(k);
      }
    }
  };

  const highightPositon = (position) => {
    const options = { lineWidth: 2, strokeStyle: '#16a34a' };
    Object.assign(ctx, options);
    let [x, y] = board[position].coord;
    ctx.beginPath();
    ctx.rect(x - charWidth / 2, y - charHeight / 2, charWidth, charHeight);
    ctx.stroke();
  };

  const moveChar = (c, from, to) => {
    if (from.paths.includes(to.id)) {
      clearBoard();
      from.char = '';
      to.char = c;
      updateBoard();
    }
  };

  const newGame = () => {
    clearBoard();
    board.a.char = 'tiger';
    board.b.char = '';
    board.c.char = '';
    board.d.char = '';
    board.e.char = '';
    board.f.char = '';
    board.g.char = '';
    board.h.char = 'goat';
    board.i.char = 'goat';
    board.j.char = 'goat';
    updateBoard();
  };

  const getMousePos = (event) => {
    let rect = canvas.getBoundingClientRect();
    m.x = Math.round(event.clientX - rect.left);
    m.y = Math.round(event.clientY - rect.top);
  };

  const highlightChar = () => {
    for (const [k, v] of Object.entries(board)) {
      if (v.char) {
        let [x, y] = v.coord;
        if (
          m.x > x - charWidth / 2 &&
          m.x < x + charWidth / 2 &&
          m.y > y - charHeight / 2 &&
          m.y < y + charHeight / 2
        ) {
          highightPositon(k);
          break;
        }
      }
    }
  };

  const removeHighlight = () => {
    clearBoard();
    drawBoard();
    updateBoard();
  };
</script>

<div class="container flex justify-center">
  <div class="box-border border-slate-800 border-8 rounded-md">
    <div class="bg-slate-600 text-center text-gray-800 pt-5 pb-0">
      <p class="text-4xl font-bold font-sans">Baghchal</p>
      <p class="text-xl font-bold font-sans">A Tiger's move</p>
    </div>

    <div class="bg-slate-500">
      <canvas
        on:mousemove={getMousePos}
        on:mousedown={highlightChar}
        width={canvasWidth}
        height={canvasHeight}
        bind:this={canvas}
      />
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
          <label class="form-check-label text-gray-800" for="playAsTiger">Tiger</label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
            type="radio"
            name="playAs"
            id="playAsGoat"
            checked
          />
          <label class="form-check-label inline-block text-gray-800" for="playAsGoat">Goat</label>
        </div>
      </div>

      <button
        on:click={newGame}
        class="m-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
        >New Game</button
      >
    </div>
  </div>
</div>
