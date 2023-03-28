<script>
  import { onMount } from 'svelte';

  let menu = true;
  let canvas;
  let ctx;

  export let canvasWidth = 500;
  export let canvasHeight = 500;

  let charWidth = 50;
  let charHeight = 50;

  let board = {
    a: {
      id: 'a',
      coord: [canvasWidth / 2, 50],
      paths: ['b', 'c', 'd'],
      jumps: { e: 'b', g: 'd' }
    },
    b: {
      id: 'b',
      coord: [canvasWidth / 2 - 75, 150],
      paths: ['a', 'c', 'e'],
      jumps: { d: 'c' }
    },
    c: {
      id: 'c',
      coord: [canvasWidth / 2, 150],
      paths: ['a', 'b', 'd'],
      jumps: {}
    },
    d: {
      id: 'd',
      coord: [canvasWidth / 2 + 75, 150],
      paths: ['a', 'c', 'g'],
      jumps: {}
    },
    e: {
      id: 'e',
      coord: [canvasWidth / 2 - 150, canvasHeight / 2],
      paths: ['b', 'f'],
      jumps: { a: 'b', g: 'f' }
    },
    f: {
      id: 'f',
      coord: [canvasWidth / 2, 250],
      paths: ['e', 'g', 'i'],
      jumps: {}
    },
    g: {
      id: 'g',
      coord: [canvasWidth / 2 + 150, canvasHeight / 2],
      paths: ['d', 'f'],
      jumps: { a: 'd', e: 'f' }
    },
    h: {
      id: 'h',
      coord: [canvasWidth / 2 - 150, 400],
      paths: ['i'],
      jumps: { j: 'i' }
    },
    i: {
      id: 'i',
      coord: [canvasWidth / 2, 400],
      paths: ['f', 'h', 'j'],
      jumps: {}
    },
    j: {
      id: 'j',
      coord: [canvasWidth / 2 + 150, 400],
      paths: ['i'],
      jumps: { h: 'i' }
    }
  };

  let m = { x: 0, y: 0 };

  let selectedChar, selectedPos;
  let playAs = 'goat';

  onMount(() => {
    ctx = canvas.getContext('2d');
    newGame();
  });

  const toggleMenu = () => (menu = !menu);

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
    for (const [k, v] of Object.entries(board)) {
      if (v.char) {
        drawCharacter(k);
      }
    }
  };

  const select = (position) => {
    clearBoard();
    drawBoard();
    const options = { lineWidth: 2, strokeStyle: '#16a34a' };
    Object.assign(ctx, options);
    let [x, y] = board[position].coord;
    ctx.beginPath();
    ctx.rect(x - charWidth / 2, y - charHeight / 2, charWidth, charHeight);
    ctx.stroke();
    updateBoard();
  };

  const isEmpty = (position) => !board[position].char;
  const canMove = (from, to) => isEmpty(to) && board[from].paths.includes(to);
  const canJump = (from, to) => isEmpty(to) && Object.keys(board[from].jumps).includes(to);

  const move = (character, from, to) => {
    clearBoard();
    drawBoard();
    board[from].char = '';
    board[to].char = character;
    updateBoard();
  };

  const jump = (from, to) => {
    clearBoard();
    drawBoard();
    board[from].char = '';
    board[to].char = 'tiger';
    board[board[from].jumps[to]].char = '';
    updateBoard();
  };

  const newGame = () => {
    clearBoard();
    drawBoard();
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
    selectedChar = '';
    selectedPos = '';
  };

  const isPosition = (x, y) =>
    m.x > x - charWidth / 2 &&
    m.x < x + charWidth / 2 &&
    m.y > y - charHeight / 2 &&
    m.y < y + charHeight / 2;

  const getPosition = () => {
    for (const [k, v] of Object.entries(board)) {
      let [x, y] = v.coord;
      if (isPosition(x, y)) {
        return k;
      }
    }
  };

  const handleClick = (event) => {
    let rect = canvas.getBoundingClientRect();
    m.x = Math.round(event.clientX - rect.left);
    m.y = Math.round(event.clientY - rect.top);

    let position = getPosition();
    if (!position) {
      return;
    } else if (board[position].char) {
      select(position);
      selectedChar = board[position].char;
      selectedPos = position;
    } else if (selectedChar && canMove(selectedPos, position)) {
      move(selectedChar, selectedPos, position);
      selectedChar = '';
      selectedPos = '';
    } else if (selectedChar === 'tiger' && canJump(selectedPos, position)) {
      jump(selectedPos, position);
      selectedChar = '';
      selectedPos = '';
    } else {
    }
  };
</script>

{#if menu}
  <div id="menu" class="w-full h-full bg-gray-800 bg-opacity-70 top-0 fixed">
    <div class="flex justify-center items-center h-screen">
      <div class="flex flex-col items-center border bg-gray-800 text-white px-10 py-10 rounded-lg">
        <p class="text-lg font-bold">Play as:</p>
        <div class="form-check">
          <input
            class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
            type="radio"
            name="playAs"
            id="playAsTiger"
            bind:group={playAs}
            value="tiger"
          />
          <label class="form-check-label" for="playAsTiger">Tiger</label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input appearance-none rounded-full h-4 w-4 border bg-white checked:bg-blue-600 transition duration-200 cursor-pointer"
            type="radio"
            name="playAs"
            id="playAsGoat"
            bind:group={playAs}
            value="goat"
          />
          <label class="form-check-label inline-block text-white" for="playAsGoat">Goat</label>
        </div>

        <button
          on:click={toggleMenu}
          class="m-5 bg-blue-500 hover:bg-blue-700 text-white font-bold px-5 py-1 rounded"
          >Start</button
        >
      </div>
    </div>
  </div>
{/if}

<div class="flex justify-center py-10">
  <div class="box-border border-slate-800 border-8 rounded-md">
    <div class="bg-slate-600 text-center text-gray-800 pt-5 pb-0">
      <p class="text-4xl font-bold font-sans">Baghchal</p>
      <p class="text-xl font-bold font-sans">A Tiger's move</p>
    </div>

    <div class="bg-slate-500">
      <canvas
        on:mousedown={handleClick}
        width={canvasWidth}
        height={canvasHeight}
        bind:this={canvas}
      />
    </div>

    <div class="flex flex-row justify-center items-center bg-slate-600 ">
      <button
        on:click={toggleMenu}
        class="m-5 bg-blue-500 hover:bg-blue-700 text-white font-bold px-5 py-1 rounded"
        >New Game</button
      >
    </div>
  </div>
</div>
