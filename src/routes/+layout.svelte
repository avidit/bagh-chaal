<script>
  import '../app.css';
</script>

<main>
  <slot />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    align-items: center;
  }
</style>
