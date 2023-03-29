<script setup lang="ts">
  import { computed, reactive, watch, watchPostEffect } from 'vue';
  import Graph from './components/Graph.vue';
  import DataTable from './components/DataTable.vue';
  import ClassConfigCard from './components/ClassConfigCard.vue'
  import { CalculationController, InputSet } from './controller';
  import { ClassEntity } from './model/classes/ClassEntity';
  import { AccuracyMode, Preset } from './model/utility/types';
  import Util from './model/utility/util';
  import D20AccuracyProvider from './model/utility/accuracy';
  const state = reactive({
    outputModes:[
      {value: 'raw', title: 'Raw DPR'},
      {value: 'red', title: 'RED-scaled DPR'},
      {value: 'accuracy', title: 'Accuracy (%)'}
    ],
    accuracyModes: [
      {value: 'equal', title: 'CR = level'},
      {value: 'boss', title: 'CR = level + 3'},
      {value: 'half', title: 'CR = level/2'}
    ],
    outputMode: {value: 'raw', title: 'Raw DPR'},
    accuracyMode: 'equal',
    tableHorizontal: true,
    data: [],
    calculableItems: [],
    showConfigs: false,
    accuracyProvider: new D20AccuracyProvider('dmg'),
    classInstances: new Map<string, ClassEntity>()
  })

  const outputStyle = computed(() => {
    if (!state.tableHorizontal) {
      return {
        display: 'flex' as const,
        flexFlow: 'row' as const,
        gap: '8px',
        padding: '16px'
      }
    }
    return {
      display: 'block',
      padding: '16px'
    }
  })

  const controller = new CalculationController()
  state.classInstances = controller.getCalculatables(state.accuracyProvider, state.accuracyMode as AccuracyMode);
  
  function doCalculations(){
    state.calculableItems.forEach((v: InputSet) => {
      v.provider.accuracyMode = state.accuracyMode as AccuracyMode
      v.provider.accuracyProvider = state.accuracyProvider
    })
    state.data = controller.calculate(state.calculableItems)
  }

  function onSelected(preset: Preset) {
    state.calculableItems.push (new InputSet(preset.obj, preset.type, preset.name, Util.getRandomColor()));
    doCalculations()
  }

  function clear() {
    state.calculableItems.splice(0);
    state.data.splice(0);
  }

  function showConfig() {
    state.showConfigs = !state.showConfigs
  }

  function removeSelected(index: number){
    state.calculableItems.splice(index, 1);
    doCalculations();
  }
  
</script>

<template>
  <v-app>
    <v-app-bar color="red-lighten-1">
      <v-app-bar-title>
        D&D DPR Simulator (RED)
      </v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer color="red-lighten-3">
      <v-list>
        <v-list-item
          title="Calculation Mode"
        >
          <v-list-item-action>
            <v-select label="Mode" :items="state.outputModes" return-object single-line v-model="state.outputMode" @update:model-value="doCalculations"></v-select>
          </v-list-item-action>
        </v-list-item>
        <v-list-item
          title="Accuracy Mode"
        >
          <v-list-item-action>
            <v-select label="Mode" :items="state.accuracyModes" single-line v-model="state.accuracyMode" @update:model-value="doCalculations"></v-select>
          </v-list-item-action>
        </v-list-item>
        <v-list-item
          title="Table Layout"
        >
          <v-list-item-action>
            <v-switch 
              v-model.lazy="state.tableHorizontal"
              :label="state.tableHorizontal ? 'Horizontal' : 'Vertical'"
            ></v-switch>
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-btn @click="clear" prepend-icon="mdi-delete" color="red-darken-3">Clear</v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-for="(item, index) in state.calculableItems" :key="index">
          <v-chip :closable="true" @click:close="removeSelected(index)" :label="true" :style="{backgroundColor:item.color}">{{ item.label }}</v-chip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main style="overflow-x:auto">
      <div v-if="state.showConfigs" style="width:fit-content;padding:16px;box-shadow: 2px 2px 5px rgba(0,0,0,0.2);background-color: #999;">
        <div style="display:flex;flex-flow:row wrap;gap:8px;padding: 4px 16px">
          <ClassConfigCard 
            title="Barbarian"  
            :presets="state.classInstances.get('barbarian').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('barbarian')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['baseDieSize'])" 
            :toggles="['useRage']" 
            :dials="['gWMProcRate', 'combats', 'roundsPerLR', 'recklessPercent']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Bard"  
            :presets="state.classInstances.get('bard').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('bard')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage', 'baseDieSize', 'saveType'])" 
            :toggles="[]" 
            :dials="[]"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Cleric"  
            :presets="state.classInstances.get('cleric').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('cleric')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['procRate', 'baseDieSize', 'saveType'])" 
            :toggles="[]" 
            :dials="['uptime']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Druid"  
            :presets="state.classInstances.get('druid').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('druid')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage'])" 
            :toggles="[]" 
            :dials="[]"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Fighter"  
            :presets="state.classInstances.get('fighter').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('fighter')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['weaponType', 'baseDieSize', 'advantage', 'disadvantage'])" 
            :toggles="['useActionSurge']" 
            :dials="['gWMProc', 'gWMStart']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Monk"  
            :presets="state.classInstances.get('monk').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('monk')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage'])" 
            :toggles="['unarmedOnly']" 
            :dials="['rounds', 'rests']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Paladin"  
            :presets="state.classInstances.get('paladin').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('paladin')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage', 'baseDieSize'])" 
            :toggles="['oncePerTurn', 'highestSlotFirst', 'greatWeaponStyle', 'greatWeaponMaster']" 
            :dials="['rounds']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Ranger"  
            :presets="state.classInstances.get('ranger').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('ranger')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage', 'baseDieSize'])" 
            :toggles="['archery']" 
            :dials="['markUptime']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Rogue"  
            :presets="state.classInstances.get('rogue').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('rogue')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['baseDieSize', 'procChance', 'advantage', 'disadvantage'])" 
            :toggles="[]" 
            :dials="[]"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Sorcerer"  
            :presets="state.classInstances.get('sorcerer').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('sorcerer')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage', 'baseDieSize'])" 
            :toggles="['useQuicken', 'hasMatchingElementalAffinity']" 
            :dials="['rounds']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Warlock"  
            :presets="state.classInstances.get('warlock').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('warlock')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage'])" 
            :toggles="['hasAB']" 
            :dials="['rounds', 'duration']"
          ></ClassConfigCard>
          <ClassConfigCard 
            title="Wizard"  
            :presets="state.classInstances.get('wizard').presets(state.accuracyProvider, state.accuracyMode as AccuracyMode)" 
            :base-object="state.classInstances.get('wizard')" 
            @config-selected="onSelected($event)" 
            :show-options="new Set(['advantage', 'disadvantage', 'procChance', 'baseDieSize'])" 
            :toggles="['empoweredEvocation', 'preferWeapons']" 
            :dials="[]"
          ></ClassConfigCard>
        </div>
        <v-btn @click="showConfig" style="margin-top:16px">Hide Configuration Options</v-btn>
      </div>
      <div v-else style="width:100%;padding:16px;box-shadow: 2px 2px 5px rgba(0,0,0,0.2);background-color: #999;">
        <v-btn @click="showConfig">Show Configuration Options</v-btn>
      </div>
      <v-card v-if="state.calculableItems.length > 0" :style="outputStyle">
        <Graph
          :data="state.data"
          :mode="state.outputMode.value as 'red' | 'raw' | 'accuracy'"
          style="max-width:800px;max-height:400px"
        ></Graph>
        <DataTable 
          :data="state.data" 
          :mode="state.outputMode.value as 'red' | 'raw' | 'accuracy'" 
          :horizontal="state.tableHorizontal"  
        ></DataTable>
      </v-card>
      <v-card v-else title="No configurations set">

      </v-card>
      
    </v-main>
  </v-app>
</template>
