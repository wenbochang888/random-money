<template>
  <div id="app">
    <HomePage 
      v-if="currentPage === 'home'" 
      @navigate="navigateTo"
    />
    <DeathSimulator 
      v-else-if="currentPage === 'death'"
      @go-back="goHome"
    />
    <LotteryGame 
      v-else-if="currentPage === 'lottery'"
      @go-back="goHome"
    />
    <RandomNamePicker 
      v-else-if="currentPage === 'picker'"
      @go-back="goHome"
    />
    <AgeGuessingGame 
      v-else-if="currentPage === 'ageguess'"
      @go-back="goHome"
    />
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue';
import DeathSimulator from './components/DeathSimulator.vue';
import LotteryGame from './components/LotteryGame.vue';
import RandomNamePicker from './components/RandomNamePicker.vue';
import AgeGuessingGame from './components/AgeGuessingGame.vue';

export default {
  name: 'App',
  components: {
    HomePage,
    DeathSimulator,
    LotteryGame,
    RandomNamePicker,
    AgeGuessingGame
  },
  data() {
    return {
      currentPage: 'home' // 'home', 'death', 'lottery', 'picker', 'ageguess'
    };
  },
  methods: {
    navigateTo(page) {
      this.currentPage = page;
      // 切换页面时滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    goHome() {
      this.currentPage = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
  background-attachment: fixed;
}

#app {
  min-height: 100vh;
  overflow-y: auto !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
