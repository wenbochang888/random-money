<template>
  <div id="app">
    <DeathSimulator />
  </div>
</template>

<script>
import DeathSimulator from './components/DeathSimulator.vue';

export default {
  name: 'App',
  components: {
    DeathSimulator
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, sans-serif;
  overflow-y: auto !important;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

#app {
  min-height: 100vh;
  overflow-y: auto !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
