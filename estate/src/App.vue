<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h1>Estate Monitor</h1>
      </div>

      <v-spacer></v-spacer>
  
    </v-app-bar>

    <v-main>
      <Estate/>
    </v-main>
  </v-app>
</template>

<script>
import Estate from './components/Estate';

export default {
  name: 'App',

  components: {
    Estate,
  },

  data: () => ({
    //
  }),
};
</script>
