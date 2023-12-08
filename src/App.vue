<!--i had the idea that i have a mensa,speise & settings component, the idea was to switch between them
this is the parent "vue component"-->

<template>
  <div id="app">
    <!--
  <div class="buttons">
      <button @click="setActiveComponent('MensaComponent')">Mensa Component</button>
      <button @click="setActiveComponent('SpeiseplanComponent')">Speiseplan Component</button>
      <button @click="setActiveComponent('ThumbLayoutComponent')">ThumbLayout Component</button>
      <button @click="setActiveComponent('EinstellungenComponent')">Einstellungen Component</button>

    </div>
-->
    <div class="content">
      <template v-if="activeComponent === 'MensaComponent'">
        <MensaComponent @switch-component="handleComponentSwitch" />
      </template>
      <template v-else-if="activeComponent === 'SpeiseplanComponent'">
        <SpeiseplanComponent :mensa="componentData.mensa" @switch-component="handleComponentSwitch" />
      </template>
        <template v-else-if="activeComponent === 'EinstellungenComponent'">
          <EinstellungenComponent @switch-component="handleComponentSwitch" />
        </template>

    </div>
  </div>
</template>

<script>
import SpeiseplanComponent from './components/SpeiseplanComponent.vue'
import MensaComponent from './components/MensaComponent.vue'
import EinstellungenComponent from './components/EinstellungenComponent.vue';

export default {
  name: 'App',
  components: {
    SpeiseplanComponent,
    MensaComponent,
    EinstellungenComponent,
  },
  data() {
    return {
      activeComponent: 'MensaComponent', // Set the initial active component
      componentData: { mensa: null }
    };
  },
  created(){
    this.activeComponent = localStorage.getItem('activeComponent') || 'MensaComponent';
  },
  methods: {
    setActiveComponent(componentName) {
      this.activeComponent = componentName;
      localStorage.setItem('activeComponent', componentName);
    },
    handleComponentSwitch(component, mensa) {
      // make
      if (mensa){
      console.log(mensa.id, mensa.name + 'in app component und component:'+ component)

        this.componentData.mensa = mensa
      }
        this.setActiveComponent(component);
        console.log('app: handlecomponentSwitch: component switched')
        // Perform any other necessary actions with id and name

    },
  },
};
</script>

<style>
/* Add your styles here */
</style>
