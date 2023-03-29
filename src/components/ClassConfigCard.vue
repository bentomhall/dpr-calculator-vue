<template>
    <v-card width="15%" style="padding:4px;display:flex;flex-direction: column;">
        <template v-slot:title>{{ props.title }}</template>
        <v-list density="compact" v-if="!state.showCustomization">
            <v-list-item v-for="item in presetItems" :key="item.title" @click="presetSelected($event, item.title)"> {{ item.title }}
            </v-list-item>
        </v-list>
        <div style="flex: 1 1 0px"></div>
        <v-card-actions style="flex: 0 0 auto">
            <v-btn variant="text" style="width:100%" :append-icon="state.showCustomization ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="state.showCustomization = !state.showCustomization">Customize</v-btn>
        </v-card-actions>

        <v-expand-transition>
            <v-card v-if="state.showCustomization" style="padding:2px">
                <v-text-field variant="underlined" v-model="state.configurationName" label="Configuration name"></v-text-field>
                <v-select variant="underlined" :items="state.typeOptions" v-model="state.type" label="Type" :disabled="state.typeOptions.length == 1" :error="state.typeError"></v-select>
                <v-text-field v-if="props.showOptions.has('baseDieCount')" variant="underlined" v-model.number="state.baseDieCount" label="Base Die Count"></v-text-field>
                <v-text-field v-if="props.showOptions.has('baseDieSize')" variant="underlined" v-model.number="state.baseDieSize" label="Base Die Size" ></v-text-field>
                <v-text-field v-if="props.showOptions.has('procChance')" variant="underlined" v-model.number="state.procChance" label="Proc Chance"></v-text-field>
                <v-select variant="underlined" v-if="props.showOptions.has('saveType')" :items="['DEX', 'WIS']" v-model="state.saveType" label="Cantrip Save Type"></v-select>
                <v-select variant="underlined" v-if="props.showOptions.has('weaponType')" :items="state.weaponOptions" v-model="state.weaponType" label="Weapon Type"></v-select>
                <v-text-field v-if="props.showOptions.has('advantage')" variant="underlined" v-model.number="state.advantage" label="Advantage (decimal)"></v-text-field>
                <v-text-field v-if="props.showOptions.has('disadvantage')" variant="underlined" v-model.number="state.disadvantage" label="Disadvantage (decimal)"></v-text-field>
                <v-switch v-for="[tKey, tValue] in Object.entries(state.toggles)" :key="tKey" :label="getLabelForVarying(tKey)" v-model="state.toggles[tKey]"></v-switch>
                <v-text-field variant="underlined" v-for="[dKey, dValue] in Object.entries(state.dials)" :key="dKey" :label="getLabelForVarying(dKey)" v-model.number="state.dials[dKey]"></v-text-field>
                <v-btn @click="save" variant="outlined" style="width:100%">Apply</v-btn>
            </v-card>
        </v-expand-transition>
    </v-card>

</template>

<script setup lang="ts">
    import { reactive, computed } from 'vue';
import { ClassEntity } from '../model/classes/ClassEntity';
import { ClassOptions } from '../model/classes/ExtrasFactory';
import { WeaponDie } from '../model/utility/features';
    import { Preset, SaveType } from '../model/utility/types';

    const props = defineProps<{
        title: string, 
        presets: Preset[],
        baseObject: ClassEntity, 
        showOptions: Set<string>
        toggles: string[],
        dials: string[]
    }>()

    const emits = defineEmits<{
        (e: 'configSelected', preset: Preset) : void
    }>()

    function getLabelForVarying(key: string): string {
        let description = props.baseObject.getDescription(key)
        return description ? description : key
    }
    const state = reactive({
        showCustomization: false,
        configurationName: props.title,
        type: props.baseObject.validTypes.length == 1 ? props.baseObject.validTypes[0] : '',
        selectedPresets: [],
        baseDieCount: 1,
        baseDieSize: 1,
        procChance: 0,
        saveType: 'DEX',
        weaponType: WeaponDie.d8,
        advantage: 0,
        disadvantage: 0,
        toggles: Object.fromEntries(props.toggles.map(v => [v, false])),
        dials: Object.fromEntries(props.dials.map(v => [v, 0])),
        weaponOptions: [
            {title: '1d4', value:WeaponDie.d4},
            {title: '2d4', value:WeaponDie.d4x2},
            {title: '1d6', value:WeaponDie.d6},
            {title: '1d8', value: WeaponDie.d8},
            {title: '1d10', value:WeaponDie.d10},
            {title: '1d12', value:WeaponDie.d12},
            {title: '2d6', value:WeaponDie.d6x2}
        ],
        typeOptions: props.baseObject.validTypes.map(t => {
            return {
                value: t,
                title: getLabelForVarying(t)
            }
        }),
        typeError: false
    })
    const presetItems = computed(() => {
        return props.presets.map(preset => {
            return {
                title: preset.name,
                value: preset,
                selected: false
            }
        })
    })
    
    function save() {
        if (!state.type || state.type.length == 0) {
            state.typeError = true;
            return
        } else {
            state.typeError = false;
        }
        let options = new ClassOptions(
            state.advantage, 
            state.disadvantage, 
            state.baseDieSize, 
            state.procChance, 
            state.baseDieCount, 
            state.saveType as SaveType, 
            state.weaponType, 
            new Map(Object.entries(state.toggles)), 
            new Map(Object.entries(state.dials))
        )
        let calculator = props.baseObject.configure(options)
        let preset : Preset = {
            name: state.configurationName,
            obj: calculator,
            type: state.type
        }
        emits("configSelected", preset)
        state.showCustomization = false
    }

    function presetSelected(event: Event, id: string) {
        let preset = props.presets.find(p => p.name == id)
        emits("configSelected", preset)
    }

    
</script>