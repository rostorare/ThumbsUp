
<template>
  <div class="container-fluid">
    <div class="row row1">
      <div v-if="showLogo" class="logo-container">
        <LogoComponent />
      </div>

      <h3 class="heading">{{ mensaName }} <br> {{ selectedDate }}</h3>





    </div>
    <DatepPickerCompontent v-model="selectedDate" @selectedDate="loadMenueOnDate" class="datepicker">
    </DatepPickerCompontent>

    <!--if else block -->
    <!-- wenn keine MenueData dann ist es entweder am Wochenende oder die Mensa hat keine Speiseplan -->
    <div v-if="menueData.length === 0" class="message">
      <div v-if="isWeekend && !isDateSelected" class="message">
        <p>
          Heute ist die Mensa {{ this.mensa.name }} geschlossen. Suchen Sie bitte einen anderen Tag aus
        </p>
      </div>
      <div v-else class="message">
        <p>Speiseplan ist nicht Verfügbar</p>
      </div>
    </div>

    <!--sonnst werden alle Meals, katgorisiert angezeigt in einer overscroller -->
    <div class="over-scroller" v-else>
      <div class="row" id="row2" style="height: calc(20vh);"></div>
      <div class="vegan-toggle">
        <span>Nur vegane Speisen anzeigen</span>
        <label class="switch">
          <input type="checkbox" id="veganToggle" v-model="showOnlyVegan" />
          <span class="slider round">
          </span>
        </label>
      </div>

      <!--Schleife für alle Gruppe(nach Kategorien geteilt)-->
      <div v-for="group in filteredMenuData" :key="group.category">
        <!--Category header-->
        <div class="category-container">
          <h2 class="category-heading" @click="toggleCategory(group.category)">
            {{ group.category }}
            <i class="fas fa-chevron-down chevron" style="float: right;" v-show="!isCategoryOpen(group.category)"></i>
            <i class="fas fa-chevron-up chevron" style="float: right;" v-show="isCategoryOpen(group.category)"></i>
          </h2>
        </div>
        <!--Alle Meals werden aufgelistet-->
        <div class="meal-item-container" v-show="isCategoryOpen(group.category)">
          <br>
          <div v-for="meal in group.meals" :key="meal.ID" class="menue-item">
            <div class="meal-info">
              <div class="meal-header">
                <p>
                  <b class="meal-name">{{ meal.name }}</b>
                  <span class="references"> ({{ meal.additives.map(additive => additive.referenceid).join(', ') }})</span>
                </p>
                <div v-if="isVegan(meal)" class="vegan-icon" v-show="isVegan(meal)">
                  <i class="fas fa-leaf"></i>
                </div>
              </div>
              <table class="price-table">
                <tr>
                  <td>Studierende:</td>
                  <td>{{ meal.prices[0]?.price || '0.0' }}€</td>
                </tr>
                <tr>
                  <td>Angestellte:</td>
                  <td>{{ meal.prices[1]?.price || '0.0' }}€</td>
                </tr>
                <tr>
                  <td>Gäste:</td>
                  <td>{{ meal.prices[2]?.price || '0.0' }}€</td>
                </tr>
              </table>
            </div>
            <hr>
          </div>
        </div>
      </div>
      <div>
      </div>
      <div class="row" id="row2" style="height: calc(20vh);"></div>
    </div>
    <ThumbLayoutComponent @mensaHomeSelected="switchToMensa(mensa)"
      @locationSelected="switchToMensaAndInvokeDistanceCalculation" @favoriteMensaOrder="switchToMensaAndOrderByFavorite"
      @searchSelected="switchToMensaAndSearch" @einstellungenSelected="switchToEinstellungen"
      class="thumblayout-button" />
  </div>
</template>

<script>
import { getMenue } from '../api/menueService';
import LogoComponent from "@/components/LogoComponent.vue";
import ThumbLayoutComponent from './ThumbLayoutComponent.vue';
import DatepPickerCompontent from './DatePickerComponent.vue';
import eventBus from '../eventBus.js';

export default {
  name: 'SpeiseplanComponent',
  props: ['mensa'],
  components: {
    LogoComponent,
    ThumbLayoutComponent,
    DatepPickerCompontent,
  },
  data() {
    return {
      mensaName: '',
      menueData: [],
      selectedDate: null,
      openCategories: [],
      showOnlyVegan: false,
      showLogo: false,
      isDateSelected: false,


    };
  },

  methods: {
    async loadMenueToday() {
      try {
        //console.log(this.mensa.id + ' spc mensa id');


        const timezoneOffsetInMinutes = new Date().getTimezoneOffset();
        const timezoneOffsetInMilliseconds = timezoneOffsetInMinutes * 60 * 1000;
        const currentDateInUTC = new Date().getTime() - timezoneOffsetInMilliseconds;
        const startDate = new Date(currentDateInUTC).toISOString().split('T')[0];

        //const startDate = new Date().toISOString().split('T')[0];
        //console.log("load menue today datum");
        console.log(startDate);
        this.selectedDate = startDate;
        const menue = await getMenue(this.mensa.id, startDate, startDate);
        this.mensaName = this.mensa.name.replace(/Mensa-|Mensa/g, '');
        this.menueData = this.groupMealsByCategory(menue);
        // console.log(this.menueData);
        this.saveDataToLocalStorage();
      } catch (error) {
        console.error(error);
      }
    },
    async loadMenueOnDate(date) {
  try {
    const startDate = date ? this.formatDate(date) : null;
    this.selectedDate = startDate;

    const menue = await getMenue(this.mensa.id, startDate, startDate);
    this.mensaName = this.mensa.name.replace(/Mensa-|Mensa/g, '');
    this.menueData = this.groupMealsByCategory(menue);
    this.saveDataToLocalStorage();
    this.isDateSelected = true;
  } catch (error) {
    console.error(error);
  }
},

formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
},


    // Method to toggle the visibility of a category
    toggleCategory(category) {
      const index = this.openCategories.indexOf(category);
      if (index !== -1) {
        // If category is in openCategories, remove it to close the container
        this.openCategories.splice(index, 1);
      } else {
        // If category is not in openCategories, add it to open the container
        this.openCategories.push(category);
      }
    },

    // Method to check if a category is open
    isCategoryOpen(category) {
      return this.openCategories.includes(category);
    },


    //Method to group meals by category
    //object map with category is key and an array meals in that category
    groupMealsByCategory(menue) {
      const groupedMeals = {};
      for (const menueItem of menue) {
        for (const meal of menueItem.meals) {
          //when the category is not in the grouped meal, it will create a new category-array for this category in this
          if (!groupedMeals[meal.category]) {
            groupedMeals[meal.category] = [];
          }
          //if not, meal will add to the category in array groupedMeals, where the index is the matching category
          groupedMeals[meal.category].push(meal);
        }
      }
      return Object.entries(groupedMeals).map(([category, meals]) => ({
        category,
        meals,
      }));
    }, switchToMensaAndSearch() {
      this.deleteDataFromLocalStorage()
      //  console.log('search emitted')
      this.switchToMensa(this.mensa)
      setTimeout(() => {
        eventBus.emit('due');
        //     console.log('search');
      }, 300);
    },
    switchToMensaAndInvokeDistanceCalculation(data) {
      this.deleteDataFromLocalStorage()
      //   console.log('location emitted ?=' + data);
      this.switchToMensa(this.mensa);
      setTimeout(() => {
        eventBus.emit('uno', data);
        //       console.log('switch invoke in speise ended? success?');
      }, 500);
    },
    switchToMensaAndOrderByFavorite() {
      this.deleteDataFromLocalStorage()
      //   console.log('speiseplanC: switch to mensa and order');
      this.switchToMensa(this.mensa);
      setTimeout(() => {
        eventBus.emit('quattro');
        //   console.log('switch invoke $ order by fave scuess?');
      }, 500);
    },
    switchToMensa(mensa) {
      this.deleteDataFromLocalStorage()
      //  console.log('switch m in speisecomp init');
      this.$emit('switch-component', 'MensaComponent', mensa);
    },
    switchToEinstellungen() {
      this.deleteDataFromLocalStorage()
      //  console.log('switch e in speisecomp init');
      this.$emit('switch-component', 'EinstellungenComponent');
    },
    deleteDataFromLocalStorage() {
      localStorage.removeItem('menueData');
      this.mensaName = '';
      this.menueData = [];
    },
    saveDataToLocalStorage() {
      const data = {
        mensaName: this.mensaName,
        menueData: this.menueData,
      };
      localStorage.setItem('menueData', JSON.stringify(data));
    },
    loadDataFromLocalStorage() {
      const data = JSON.parse(localStorage.getItem('menueData'));
      if (data) {
        this.mensaName = data.mensaName;
        this.menueData = data.menueData;
      }
    },
    isVegan(meal) {
      return meal.badges.some((badge) => badge.name === 'Vegan');
    }
  },
  created() {

    this.loadDataFromLocalStorage();
    if (this.menueData.length === 0) {
      this.loadMenueToday();
    }
    setTimeout(() => {
      this.showLogo = true;
    }, 20);
  },

  computed: {
    isWeekend() {
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
      return dayOfWeek === 0 || dayOfWeek === 6; // 0 and 6 correspond to Sunday and Saturday
    },
    filteredMenuData() {
      if (this.showOnlyVegan) {
        return this.menueData.map((group) => ({
          category: group.category,
          meals: group.meals.filter((meal) => this.isVegan(meal)),
        }));
      } else {
        return this.menueData;
      }
    },

  }
};
</script>

<style scoped >
.heading {
  position: relative;
  background-color: black;
  color: white;
  padding: 10px 20px;
  display: inline-block;
  width: 100%;
  text-align: center;
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


.message {
  color: red;
  text-align: center;
  font-size: 18px;
  margin-bottom: 20px;
}

.over-scroller {
  overflow-y: auto;
  height: calc(100vh - 220px);
  /* Adjust the height as needed */
}

.menue-item {

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.meal-item hr {
  border-color: gray;
  margin: 5px 0;
}



.category-container {
  border: 1px solid orange;
  background-color: white;
  color: black;
  border-radius: 20px;
  margin-top: 15px;
  margin-left: 6px;
  margin-right: 6px;
  box-shadow: 3px 3px 5px rgba(31, 30, 33, 0.73);
}

.meal-item-container {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  transform: translateY(-10px);
  margin-right: 5px;
  margin-left: 5px;
  z-index: -1;


}

.category-heading {
  cursor: pointer;
  font-size: 23px;
  font-weight: bold;
  margin: 5px;
  padding: 20px;
  border-radius: 5px;
}

.chevron {
  color: darkorange;
}

.meal-info {
  flex: 1;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vegan-icon {
  margin-left: 10px;
  color: green;
  font-size: 20px;
}

.price-table {
  font-size: 19px;
  /* Change the font size to your desired value, e.g., 16px */

}

.price-table td {
  padding: 5px;
}

.price-table tr:last-child td {
  border-bottom: none;
}

.meal-name {
  font-size: 20px;
  /* Change the font size to your desired value, e.g., 24px */
}

.references {
  font-size: 12px;
  /* Adjust the font size as needed */
}

.vegan-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.vegan-toggle span {
  margin-right: 10px;
  font-size: 15px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked+.slider {
  background-color: green;
}


input:checked+.slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(16px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.datepicker {
  border: 2px orange;
  position: fixed;
  bottom: 5%;
  right: 0;
  transform: translateY(-50%);
  width: 25%;
  max-width: 300px;
  z-index: 1
}


.info-box-icon {
  background-color: grey;
  border-radius: 8px;
  padding: 8px;
  color: white;
}

.info-box {
  background-color: grey;
  color: white;
}


.row1 {
  background-color: white;
}

.over-scroller {
  overflow-y: auto;
  height: calc(100vh - 220px);
  overflow-x: hidden;
  /* Prevent horizontal scrolling */
}

.thumblayout-button {
  position: fixed;
  transform: translateY(-60%);
  transform: translateX(-10%);

}
</style>

