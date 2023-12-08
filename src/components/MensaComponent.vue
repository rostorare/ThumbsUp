<template>
  <div class="container-fluid">
    <div class="row" id="row1">
      <div v-if="showLogo" class="logo-container">
        <LogoComponent />
      </div>
      <!-- searchbar-->
      <!-- ref attribute to reference the search input element and focus on it programmatically -->
      <h3 class="heading">Liste der Mensen</h3>
      <div class="search-container">
        <i class="material-icons search-icon">search</i>
        <input ref="searchInput" v-model="searchQuery" @input="searchMensas" type="text" placeholder="Mensa suchen"
          class="search-input" />
      </div>
    </div>


    <div class="row row2" style="height: calc(100vh);">
      <div class="row" id="row2" style="height: calc(20vh);"></div>
      <div class="over-scroller" v-if="filteredMensas">
        <!-- for each mensa in mensa data it will create a dropdown container  -->
        <div v-for="mensa in filteredMensas" :key="mensa.id" class="dropdown">
          <div class="card" @click="toggleCardDetails(mensa)">
            <div class="card-header">
              <h5 class="card-title">{{ mensa.name.replace(/Mensa-|Mensa/g, '') }}</h5>
              <div class="icon-container">
                <i class="material-icons favorite-icon-unfill" v-if="!mensa.favorite"
                  @click.stop="toggleFavorite(mensa)">favorite_border</i>
                <i class="material-icons favorite-icon" v-else @click.stop="toggleFavorite(mensa)">favorite</i>
              </div>
            </div>
            <div class="card-body" v-if="isCardDetailsOpen(mensa)">
              <h5>Adresse</h5>
              <button class="navigation-button" @click="navigateToGoogleMaps(mensa)">
                <i class="fas fa-location-arrow"></i>
              </button>
              <p class="card-text">
                {{ mensa.address.street }}
                <br>
                {{ mensa.address.zipcode }} {{ mensa.address.city }}
                {{ mensa.address.district }}
              </p>
              <hr>
              <h5>Öffnungszeiten</h5>
              <ul>
                <li v-for="businessDay in mensa.businessDays" :key="businessDay.day">
                  <strong>{{ businessDay.day }}:</strong>
                  <template v-if="businessDay.businessHours.length > 0">
                    <span v-for="businessHour in getFilteredBusinessHours(businessDay)" :key="businessHour.openAt"> {{
                      businessHour.openAt }} - {{ businessHour.closeAt }}
                    </span>
                  </template>
                  <template v-else>
                    <span> Geschlossen</span>
                  </template>
                </li>
              </ul>

              <hr>
              <h5>Kontakt-Info</h5>
              <p class="card-text">
                {{ mensa.contactInfo.phone }}
                <br>
                {{ mensa.contactInfo.email }}
              </p>
            </div>
            <div class="card-footer">
              <div class="card-footer-left">
                <div class="distance-container">
                  <b v-if="mensa.distance !== 0 && typeof mensa.distance !== 'undefined'">{{ mensa.distance.toFixed(1)
                  }}km</b>
                </div>
              </div>
              <div class="card-footer-right">
                <button class="restaurant-button" @click="switchToSpeiseplan(mensa)">
                  <i class="material-icons restaurant-icon">restaurant</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="row" id="row2" style="height: calc(20vh);"></div>
      </div>
    </div>

  </div>
  <!--thmblayout component used for navigation -->
  <!-- locationSelected is an event thast emited in the thumblayoutcomponent, when you click on the mensen nahe button-->
  <!-- invokeDistanceCalculation calculateds in km between 2 coordinates-->
  <ThumbLayoutComponent @locationSelected="invokeDistanceCalculation" @uno="invokeFromSpeiseCalculation"
    @quattro="orderByFavorite" @favoriteMensaOrder="orderByFavorite" @einstellungenSelected="switchToEinstellungen"
    @searchSelected="focusSearch" class="thumblayout-button">
  </ThumbLayoutComponent>
</template>

<script>
//import * as indexService from '../db/indexedDB.js';
import { getMensasFromApi, getMensasFromDB } from '../api/mensaService.js';
import LogoComponent from "@/components/LogoComponent.vue"
import ThumbLayoutComponent from './ThumbLayoutComponent.vue';
import { updatemensa } from '@/db/indexedDB';
import { calculateDistance } from '@/geolocation';

import eventBus from '@/eventBus';
//import { calculateDistance } from '@/geolocation';

export default {
  name: 'MensaComponent',
  components: {
    LogoComponent,
    ThumbLayoutComponent
  },
  data() {
    return {
      mensaData: [],
      openDropdowns: [],
      emits: ['switch-component'],
      openCardDetails: [],
      searchQuery: '',
      filteredMensas: this.mensaData,
      showLogo: false,
      refreshed: false,


    };
  },
  methods: {
    orderByFavorite() {
      console.log(this.mensData)
      // Create a copy of the mensaData array to avoid modifying the original array
      let sortedData = [...this.mensaData];

      sortedData.sort((a, b) => {
        // First, compare favorite status (true or false)
        if (a.favorite !== b.favorite) {
          return b.favorite - a.favorite; // Sort by favorite status (descending)
        }

        // If the favorite status is the same, compare the distance
        return a.distance - b.distance; // Sort by distance (ascending)
      });

      // i change the order in the db its bad style but i dont think its a problem for now,
      //maybe change it later to display the sortedData in the template..
      this.mensaData = sortedData

      localStorage.setItem('mensaData', JSON.stringify(sortedData)); // Store the sorted data in local storage
      this.searchMensas()
    },
    async invokeFromSpeiseCalculation(data) {
      console.log('mensacomp: invokefromSpeise' + data)
    },
    //data contains lat and long from your own location, see ThumbLayoutComponent locationSelected
    async invokeDistanceCalculation(data) {

      //added await to stop bugs loading time
      await this.loadMensas();
      //go through every element in mensaData and calculate
      this.mensaData.forEach((mensa) => {
        const distance = calculateDistance(data.latitude, data.longitude, mensa.address.geoLocation.latitude, mensa.address.geoLocation.longitude)
        mensa.distance = distance
        // console.log('this mensa gets updated in invoke calc pls')
        // console.log(mensa)
        // saves the distence into mensa.distance in the indexedDB
        updatemensa(mensa)
      })
      this.orderMensas()
      // console.log('updatemensa end of invokedistancecalc in mensa comp')
    },
    orderMensas() {

      // Create a copy of the mensaData array to avoid modifying the original array
      let sortedData = [...this.mensaData];

      // Sort the array by distance (ascending order)
      sortedData.sort((a, b) => {
        return a.distance - b.distance;
      });

      // i change the order in the db its bad style but i dont think its a problem for now,
      //maybe change it later to display the sortedData in the template..
      this.mensaData = sortedData

      localStorage.setItem('mensaData', JSON.stringify(sortedData)); // Store the sorted data in local storage
      this.searchMensas()
    },
    switchToSpeiseplan(mensa) {
      console.log('switch speise init' + mensa.id)
      this.$emit('switch-component', 'SpeiseplanComponent', mensa)
    },
    switchToEinstellungen() {
      console.log('switch e in speisecomp init')
      this.$emit('switch-component', 'EinstellungenComponent')
    },


    // bugfix, saving was interrupted so i check if mensaData is not empty... shitty bugfix remove it later
    async toggleFavorite(mensa) {
      if (this.mensaData.length > 0) {
        mensa.favorite = !mensa.favorite;
        //console.log('updatemensa end of togglefavorite in mensa comp')
         console.log(mensa.id)
         await updatemensa(mensa);
      }
    },


    //
    toggleDropdown(name) {
      if (this.openDropdowns.includes(name)) {
        this.closeDropdown(name);
      } else {
        this.openDropdowns.push(name);
      }
    },
    closeDropdown(name) {
      const index = this.openDropdowns.indexOf(name);
      if (index > -1) {
        this.openDropdowns.splice(index, 1);
      }
    },
    isDropdownOpen(name) {
      return this.openDropdowns.includes(name);
    },
    //loads mensas first from DB if not available from api (which then auto stores it into a new db.)
    async loadMensas() {
      try {
        let mensas;
        const storedData = localStorage.getItem('mensaData');
        if (storedData) {
          mensas = JSON.parse(storedData);
        }
        else {
          mensas = await getMensasFromDB();
        }

        if (mensas.length > 0) {
          // Database is not empty, use data from DB
          console.log('db-not-empty')
          this.mensaData = mensas;  // Assign the data to this.mensaData
          this.filteredMensas = this.mensaData

        } else {
          // Database is empty, call API and store data in DB
          console.log('db-empty-use-api')
          const apiData = await getMensasFromApi();
          this.mensaData = apiData;  // Assign the data to this.mensaData
          this.filteredMensas = this.mensaData
        }
        console.log(this.mensaData)
      } catch (error) {
        console.error(error);
      }

    },
    toggleCardDetails(mensa) {
      if (this.isCardDetailsOpen(mensa)) {
        this.closeCardDetails(mensa);
      } else {
        this.openCardDetails.push(mensa.id);
      }
    },
    closeCardDetails(mensa) {
      const index = this.openCardDetails.indexOf(mensa.id);
      if (index > -1) {
        this.openCardDetails.splice(index, 1);
      }
    },
    isCardDetailsOpen(mensa) {
      return this.openCardDetails.includes(mensa.id);
    },
    navigateToGoogleMaps(mensa) {
      const query = `${mensa.name}, ${mensa.address.street}, ${mensa.address.city}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, "_blank");
    },
    getFilteredBusinessHours(businessDay) {
      return businessDay.businessHours.filter(
        (businessHour) => businessHour.businessHourType === 'Mittagstisch'
      );
    },
    focusSearch() {
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },

    searchMensas() {
      if (this.searchQuery.trim() === '') {
        this.filteredMensas = this.mensaData;
      } else {
        const query = this.searchQuery.toLowerCase().trim();
        this.filteredMensas = this.mensaData.filter(
          (mensa) =>
            mensa.name.toLowerCase().includes(query) ||
            mensa.address.district.toLowerCase().includes(query)
        );
      }
    }
  },
  created() {
    //loads Mensa into component on creation
  this.loadMensas();


    setTimeout(() => {
      this.showLogo = true;
    }, 20);
  },

  mounted() {
    eventBus.on('uno', (data) => {
      this.invokeDistanceCalculation(data);
      console.log('mounted: uno okee?' + data.latitude, data.longitude)
    });
    eventBus.on('due', () => {
      this.focusSearch();
      //this.$emit('searchSelected');
      console.log('mounted: due okee?')
    });

    eventBus.on('quattro', () => {
      this.orderByFavorite();
      console.log('mounted: quattro');
    });

  },


}




</script>

<style scoped>
body {
  touch-action: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.dropdown-content p {
  margin: 5px 0;
}


.favorite-icon {
  font-size: 35px;
  color: red;
}

.favorite-icon-unfill {
  font-size: 35px;
  color: black;
}

.restaurant-icon {
  font-size: 25px;
  color: white;
  transform: translateY(3px);
}



#row1 {
  position: sticky;
  background-color: white;
  z-index: 2;
}


.logo-container {
  display: flex;
  justify-content: center;
  animation: fadeInLogo 1.5s ease-in-out;
}

@keyframes fadeInLogo {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.heading {
  position: relative;
  background-color: black;
  color: white;
  padding: 10px 20px;
  display: inline-block;
  width: 100%;
  text-align: center;
}

.card {
  color: black;
  background: linear-gradient(to right, floralwhite, white, floralwhite);
  top: 0;
  border-radius: 20px;
  margin-bottom: 15px;
  box-shadow: 3px 3px 9px rgba(31, 30, 33, 0.73);
}


.card-body {
  background-color: white;
}


.card-footer {
  display: flex;
  justify-content: space-between;
  /* To distribute the items evenly on the row */
  height: 50px;
}

.card-footer-right {
  display: flex;
}


.restaurant-button {

  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: orange;
  border: none;
  cursor: pointer;


}

.navigation-button {
  position: absolute;
  background-color: orange;
  color: white;
  display: flex;
  border: none;
  padding: 10px 20px;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transform: translateY(-29px);
  right: 14px;
  justify-content: center;
}

.search-container {
  position: relative;
  padding: 10px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
}

.search-input {
  padding: 10px 10px;
  padding-left: 40px;
  border: 1px solid black;
  font-size: 20px;
  border-radius: 4px;
  width: 100%;

}

.search-input:focus {
  outline: none;
  /* Remove the default outline */
  border-color: #FF9800;
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.row2 {
  background-color: white;
}

.thumblayout-button {
  position: fixed;
  transform: translateY(-60%);
  transform: translateX(-10%);

}
</style>
