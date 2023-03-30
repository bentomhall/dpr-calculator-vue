<template>
    <v-card width="31%" style="padding:4px;display:flex;flex-direction: column;">
        <template v-slot:title>Custom Entry</template>
        <v-expand-transition>
            <div v-if="data.show">
                <v-text-field variant="underlined" v-model="data.name" label="Configuration name"></v-text-field>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows:repeat(5, 1fr)">
                <v-text-field 
                    v-for="(level, index) in levels" :key="index" 
                    :name="level+'input'" 
                    v-model="data.dpr[index]" 
                    :label="level"
                    density="compact"
                    variant="outlined"
                ></v-text-field>
                </div>
                <v-btn @click="save" variant="outlined" style="width:100%">Apply</v-btn>
            </div>
        </v-expand-transition>
        <v-card-actions style="flex: 0 0 auto">
            <v-btn variant="text" style="width:100%" :append-icon="data.show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="data.show = !data.show">Customize</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { CustomData } from '../model/classes/custom';
import { Preset } from '../model/utility/types';
    const props = defineProps<{
        baseObject: CustomData
    }>()
    const levels = ref(["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"])

    const data = reactive(
        {
            dpr: [,,,,,,,,,,,,,,,,,,,],
            name: "",
            show: false
        }
    )
    const emits = defineEmits<{
        (e: 'custom-entered', preset: Preset) : void
    }>()

    function save() {
        let clone = props.baseObject.clone();
        clone.data = data.dpr.map(x => x != null ? parseFloat(x) : null);
        let preset: Preset = {
            name: data.name,
            obj: clone,
            type: ''
        }
        emits("custom-entered", preset)
        clear()
    }
    function clear() {
        data.dpr = [,,,,,,,,,,,,,,,,,,,]
        data.name = ""
        data.show = false
    }
</script>