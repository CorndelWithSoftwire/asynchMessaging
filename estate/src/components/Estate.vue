<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/estate.jpeg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>
    </v-row>
     <v-row color="primary" >
      <v-col cols="12">
         
       <v-treeview 
           :items="propertyGroups"  
           
       ></v-treeview>

      </v-col>
    </v-row>

  </v-container>
</template>

<script>
  export default {
    name: 'Estate',

    data: () => ({
      propertyGroups: [
        {
          id: 1,
          name: 'The Avenue',
          children : [
            {
               id: 101,
               name: "Beech",
               online: true,
               alerts: []
            },
            {
               id: 103,
               name: "Oak",
               online: false,
               alerts: []
            },

          ]
        },{
          id: 2,
          name: 'Broadway',
          children : [
            {
               id: 201,
               name: "Astoria",
               online: true,
               alerts: [{time: 0, text: "Below Threshold"}]
            }
          ]
        }
      ]
    }),
  }
</script>
