
<template>
  <div>
    <!--v-model for transfering the date to other components, format for displaying in german format, @closed
    calles the deliverDate function when the calender is closed-->
    <Datepicker class="custom-date-picker" v-model="date" :disabled-dates="disableDates" :format="'dd-MM-yyyy'" @closed="deliverDate" />
  </div>
</template>
<!--setup means its preprocessing-->
<script setup>
import { ref, getCurrentInstance } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const date = ref();

// Function to disable dates outside of the current week and the following week (excluding weekends)
const disableDates = (date) => {
  const today = new Date();
  const day = date.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24)); // Difference in days

  // Get the day of the current week (0-6, Sunday-Saturday)
  const currentWeekday = today.getDay();

  // Disable dates outside of the current week and the following week
  if (diff < -currentWeekday || diff > 6 - currentWeekday + 7) {
    return true;
  }

  // Disable weekends (Saturday and Sunday)
  if (day === 0 || day === 6) {
    return true;
  }

  return false;
};

const instance = getCurrentInstance();

const deliverDate = () => {
  // Emit the selected date, if you use @selectedDate in another component you can get the value of this datepicker
  //console.log('salectedate in datepicker emit'+ date.value)
  instance.emit('selectedDate', date.value);
};

</script>
<style>
.custom-date-picker {
  background-color: orange;
  padding: 2px;
  border: 1px solid black;
  border-radius: 5px;
  right: 2px;

}

</style>



