<script>
  import { onMount } from 'svelte';

  let menu = false;
  let canvas;
  let ctx;

  export let canvasWidth = 500;
  export let canvasHeight = 500;

  let pieceWidth = 50;
  let pieceHeight = 50;

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

  let selectedPiece, selectedPos, winner;
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

  const drawPiece = (position) => {
    let [x, y] = board[position].coord;
    let image = new Image();
    image.src = `${board[position].piece}.png`;
    image.onload = () =>
      ctx.drawImage(image, x - pieceWidth / 2, y - pieceHeight / 2, pieceWidth, pieceHeight);
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
    Object.entries(board).forEach(([k, v]) => {
      if (v.piece) {
        drawPiece(k);
      }
    });
  };

  const select = (position) => {
    clearBoard();
    drawBoard();
    const options = { lineWidth: 2, strokeStyle: '#16a34a' };
    Object.assign(ctx, options);
    let [x, y] = board[position].coord;
    ctx.beginPath();
    ctx.rect(x - pieceWidth / 2, y - pieceHeight / 2, pieceWidth, pieceHeight);
    ctx.stroke();
    updateBoard();
  };

  const isEmpty = (position) => !board[position].piece;
  const canMove = (from, to) => isEmpty(to) && board[from].paths.includes(to);
  const canJump = (from, to) => isEmpty(to) && Object.keys(board[from].jumps).includes(to);

  const move = (piece, from, to) => {
    clearBoard();
    drawBoard();
    board[from].piece = '';
    board[to].piece = piece;
    updateBoard();
  };

  const jump = (from, to) => {
    clearBoard();
    drawBoard();
    board[from].piece = '';
    board[to].piece = 'tiger';
    board[board[from].jumps[to]].piece = '';
    updateBoard();
  };

  const newGame = () => {
    toggleMenu();
    clearBoard();
    drawBoard();
    board.a.piece = 'tiger';
    board.b.piece = '';
    board.c.piece = '';
    board.d.piece = '';
    board.e.piece = '';
    board.f.piece = '';
    board.g.piece = '';
    board.h.piece = 'goat';
    board.i.piece = 'goat';
    board.j.piece = 'goat';
    updateBoard();
    selectedPiece = '';
    selectedPos = '';
  };

  const isPosition = (x, y) =>
    m.x > x - pieceWidth / 2 &&
    m.x < x + pieceWidth / 2 &&
    m.y > y - pieceHeight / 2 &&
    m.y < y + pieceHeight / 2;

  const getPosition = () =>
    Object.keys(
      Object.fromEntries(Object.entries(board).filter(([k, v]) => isPosition(...v.coord)))
    )[0];
  const handleClick = (event) => {
    let rect = canvas.getBoundingClientRect();
    m.x = Math.round(event.clientX - rect.left);
    m.y = Math.round(event.clientY - rect.top);

    let position = getPosition();
    if (!position) {
      return;
    } else if (board[position].piece && board[position].piece === playAs) {
      select(position);
      selectedPiece = board[position].piece;
      selectedPos = position;
    } else if (selectedPiece && canMove(selectedPos, position)) {
      move(selectedPiece, selectedPos, position);
      selectedPiece = '';
      selectedPos = '';
    } else if (selectedPiece === 'tiger' && canJump(selectedPos, position)) {
      jump(selectedPos, position);
      selectedPiece = '';
      selectedPos = '';
    } else {
    }
  };
</script>

{#if menu}
  <div id="menu" class="w-full h-full bg-gray-800 bg-opacity-70 top-0 fixed">
    <div class="flex justify-center items-center h-screen">
      <div
        class="flex flex-col items-center border bg-slate-800 text-white font-bold px-10 py-10 rounded-lg"
      >
        {#if winner}
          <p class="text-3xl py-5">{winner} won !</p>
        {/if}
        <p class="text-lg">Play as:</p>
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

        <button on:click={newGame} class="m-5 bg-blue-500 hover:bg-blue-700 px-5 py-1 rounded"
          >Start</button
        >
      </div>
    </div>
  </div>
{/if}

<div class="flex justify-center py-10">
  <div class="box-border border-slate-800 border-8 bg-slate-500 rounded-md font-bold font-sans">
    <div class="text-center text-gray-800 py-5">
      <p class="text-4xl">Baghchal</p>
      <p class="text-xl">A Tiger's move</p>
    </div>

    <canvas
      on:mousedown={handleClick}
      class="bg-slate-600"
      width={canvasWidth}
      height={canvasHeight}
      bind:this={canvas}
    />

    <div class="flex justify-center">
      <button
        on:click={toggleMenu}
        class="m-5 bg-blue-500 hover:bg-blue-700 text-white px-5 py-1 rounded">New Game</button
      >
    </div>
  </div>
</div>
