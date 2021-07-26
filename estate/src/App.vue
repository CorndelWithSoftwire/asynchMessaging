<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/estate.jpeg" width="200px">
    <Estate msg="Estate Monitor"/>
  </div>
</template>

<script>
import Estate from './components/Estate.vue'

export default {
  name: 'App',
  components: {
    Estate
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
