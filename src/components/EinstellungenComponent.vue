<template>
  <div class="einstellungen">
    <div v-if="showLogo" class="logo-container">
      <LogoComponent />
    </div>
    <h3 class="heading">Benachrichtigungen</h3>
    <div class="notification-container">
      <div class="notification-toggle">
        <span>Schicke mir die Speisepläne meiner Favoriten:</span>
        <label class="switch">
          <input type="checkbox" v-model="notificationEnabled" @change="toggleNotification" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="notification-options">
        <label>zu dieser Zeit:</label>
        <input type="time" v-model="notificationTime" @change="updateNotificationTime" />
      </div>
      <label>an folgenden Tagen: </label>
      <div class="notification-days">
        <div v-for="(day, index) in days" :key="index">
          <label>
            <input type="checkbox" v-model="selectedDays" :value="day" @change="updateNotificationDays" />
            {{ day }}
          </label>
        </div>
      </div>


    </div>

  </div>
  <ThumbLayoutComponent class="thumblayout-button " @mensaHomeSelected="switchToMensa(mensa)" @searchSelected="switchToMensaAndSearch"
    @locationSelected="switchToMensaAndInvokeDistanceCalculation" @favoriteMensaOrder="switchToMensaAndOrderByFavorite" />
</template>

<script>
import LogoComponent from "@/components/LogoComponent.vue"
import ThumbLayoutComponent from "./ThumbLayoutComponent.vue";
import eventBus from "../eventBus.js";
import {
  isNotificationSupported,
  requestNotificationPermission,
  createNotification,
  subscribeToPushNotifications,
} from "../notification.js";
import { getAllmensas } from "../db/indexedDB";
import { getMenue } from "../api/menueService"// Import the getAllmensas function

export default {
  data() {
    return {
      notificationEnabled: false,
      notificationTime: "15:22",
      selectedDays: [],
      scheduledNotification: null,
      showLogo: false,
      days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"],
    };
  },
  components: {
    LogoComponent,
    ThumbLayoutComponent
  },
  mounted() {
    this.setupNotifications();
    this.loadNotificationSettings();
  },
  created() {
    setTimeout(() => {
      this.showLogo = true;
    }, 20);
  },
  methods: {
    setupNotifications() {
      if (isNotificationSupported()) {
        if (Notification.permission === "default") {
          requestNotificationPermission();
        }
      }
    },
    async toggleNotification() {
      if (this.notificationEnabled) {
        this.scheduleNotification(); // Schedule new notification
        subscribeToPushNotifications(); // Call this function to subscribe to push notifications
      } else {
        this.cancelNotification();
      }
      this.saveNotificationSettings();
    },

    async scheduleNotification() {

      this.cancelNotification();


      if (this.selectedDays.length === 0) {

        return; // No selected days, do not schedule notification
      }

      const selectedTime = new Date(`2000-01-01T${this.notificationTime}`);
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      const now = new Date();

      // Get the list of favorite mensas from IndexedDB and filter by mensa.favorite === true
      const favoriteMensas = (await getAllmensas()).filter(mensa => mensa.favorite === true);

      for (const day of this.selectedDays) {

        const notificationDate = this.getNextNotificationDate(now, day, hour, minute);
        const timeUntilNotification = notificationDate - now;


        if (timeUntilNotification > 0) {
          this.scheduledNotification = setTimeout(async () => {
            // Loop through each favorite mensa

            for (const favoriteMensa of favoriteMensas) {
              // Make API call to fetch the menu for the given mensaId
              const startDate = now.toISOString().split("T")[0];
              const endDate = startDate;

              const menuData = await getMenue(favoriteMensa.id, startDate, endDate);

              // Create the custom body for the notification
              let body = `Speiseplan heute an ${favoriteMensa.name}:\n\n`;
              for (const meal of menuData[0].meals) {
                if (meal.prices && meal.prices.length > 0) {
                  body += `${meal.category}: ${meal.name}\n`;
                }
              }

              const options = {
                body: body.trim(), // Remove trailing newline
                icon: "./img/icons/icon-96x96.png",
              };
              createNotification("Speiseplan Notification", options);
            }
          }, timeUntilNotification);
        }
      }
    }
    ,
    cancelNotification() {
      if (this.scheduledNotification) {
        clearTimeout(this.scheduledNotification);
        this.scheduledNotification = null;
  
      }
    },
    updateNotificationTime() {
      if (this.notificationEnabled) {
        this.scheduleNotification();
      }
      this.saveNotificationSettings();
    },
    updateNotificationDays() {
      if (this.notificationEnabled) {
        this.cancelNotification();
        this.scheduleNotification();
      }
      this.saveNotificationSettings();
    },
    getNextNotificationDate(now, day, hour, minute) {
      const today = now.getDay();
      const targetDay = this.days.indexOf(day);

      let nextDate = new Date(now);
      nextDate.setDate(now.getDate() + ((targetDay + 7 - today + 1) % 7));
      nextDate.setHours(hour, minute, 0, 0);
      return nextDate;
    },
    saveNotificationSettings() {
      const notificationSettings = {
        notificationEnabled: this.notificationEnabled,
        notificationTime: this.notificationTime,
        selectedDays: this.selectedDays,
      };
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
    },
    loadNotificationSettings() {
      const notificationSettings = JSON.parse(localStorage.getItem("notificationSettings"));
      if (notificationSettings) {
        this.notificationEnabled = notificationSettings.notificationEnabled;
        this.notificationTime = notificationSettings.notificationTime;
        this.selectedDays = notificationSettings.selectedDays;
      }
    },
  switchToMensaAndSearch(){
      this.switchToMensa(this.mensa)
      setTimeout(() => {
        eventBus.emit('due');
      }, 500);
    },


    switchToMensaAndInvokeDistanceCalculation(data) {
      this.switchToMensa(this.mensa);
      setTimeout(() => {
        eventBus.emit("uno", data);
      }, 500);
    },
    switchToMensaAndOrderByFavorite() {
      this.switchToMensa(this.mensa);
      setTimeout(() => {
        eventBus.emit("quattro");
      }, 500);
    },
    switchToMensa(mensa) {
      this.$emit("switch-component", "MensaComponent", mensa);
    },

  },
};
</script>

<style scoped>
.notification-days {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.notification-days div {
  margin-bottom: 10px;
  /* Adjust as needed to control the spacing between checkboxes */
}

.notification-container {
  position: fixed;
  top: 50%;
  /* Start at the middle of the screen vertically */
  padding: 10px
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

.notification-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.notification-toggle span {
  margin-right: 10px;
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
  background-color: orange;
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

.notification-days {
  margin-top: 10px;
}
.thumblayout-button {
  position: fixed;
  transform: translateY(-60%);
  transform: translateX(-10%);

}
</style>
