<template>
  <div class="floating-action-button">
    <button class="main-button" @click="toggleButtons">
      <i class="material-icons menu-icon">menu</i>
    </button>
    <button v-for="button in additionalButtons" :key="button.id"
      :class="'additional-button additional-button-' + button.id" v-show="showAdditionalButtons"
      v-on:click="handleAdditionalButtons(button)">
      <i class="material-icons">{{ button.icon }}</i>
      <span>{{ button.string }}</span>

    </button>
  </div>
</template>

<script>
import { getMyLocation } from '../geolocation.js'
export default {

  data() {
    return {
      //for positin debugging set it on true d
      showAdditionalButtons: false,
      additionalButtons: [
        { id: 1, icon: 'home', string: '' },
        { id: 2, icon: 'search', string: '' },
        { id: 3, icon: 'my_location', string: '', },
        { id: 4, icon: 'favorite_border', string: '' },
        { id: 5, icon: 'notifications', string: '' },
      ],
    };
  },
  methods: {
    handleAdditionalButtons(button) {
      this.showAdditionalButtons = false;
      if (button.id === 1) {
   //     console.log('home mensa button clicked')
        this.$emit('mensaHomeSelected')
      }

      if (button.id === 2) {
   //     console.log('search button clicked')
        this.$emit('searchSelected')

      }

      if (button.id === 3) {
    //    console.log('mylocation button clicked')

        getMyLocation((error, latitude, longitude) => {
          if (error) {
            console.error('Error getting location:', error);
            // Handle error
          } else {
         //   console.log('Latitude:', latitude);
         //   console.log('Longitude:', longitude);
            // emits an event and transfers lat and long as params
            this.$emit('locationSelected', { latitude, longitude })

          }
        });
      }
      if (button.id === 4) {
    //    console.log('favorite mensa button clicked')

        this.$emit('favoriteMensaOrder')

      }
      if (button.id === 5) {
   //     console.log('einstellungen  button clicked')

        this.$emit('einstellungenSelected')

      }


    },
    toggleButtons() {
      this.showAdditionalButtons = !this.showAdditionalButtons;
    },
  },
};
</script>

<style scoped>
.floating-action-button {
  position: fixed;
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
}

.main-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(to right, #DA291C, #FFC72C);
  ;
  color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s;
}

.additional-button {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(#DA291C, #FFC72C);
  color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s;
}

.additional-button-1 {
  bottom: 1vh;
  left: -30vw;

}

.additional-button-2 {
  bottom: 10vh;
  left: -23vw;
}

.additional-button-3 {
  bottom: 17vh;
  left: -12vw;
}

.additional-button-4 {
  bottom: 23vh;
  left: 0vw;
}

.additional-button-5 {
  bottom: 28vh;
  left: 13vw;
}

.menu-icon {
  font-size: 55px;
}
</style>
