<template>
  <div id="app">
    <RandomNamePicker />
  </div>
</template>

<script>
import RandomNamePicker from './components/RandomNamePicker.vue';

export default {
  name: 'App',
  components: {
    RandomNamePicker
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow-y: auto !important;
}

body {
  background: url('./assets/1.jpeg') no-repeat center center fixed;
  background-size: cover;
}

#app {
  min-height: 100vh;
  overflow-y: auto !important;
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
