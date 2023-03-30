<template>
    <div style="max-width:100%">
        <h2>{{title}}</h2>
        <v-table 
            v-if="!props.horizontal"
            density="compact"
        >
            <thead>
                <tr>
                    <th :style="state.style.header">
                        Level
                    </th>
                    <th
                        v-for="set in props.data"
                        :key="set.name"
                        :style="state.style.header"
                    >
                        <div style="display: inline-block">{{set.name}}</div> <div :style="getSwatchStyle(set)"></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="level in state.levels"
                    :key="level"
                    
                >
                    <td :style="state.style.element">{{ level }}</td>
                    <td v-for="set in props.data" :key="set.name" :style="state.style.element">{{ getDataForElement(set, level) }}</td>
                </tr>
                <tr>
                    <td :style="state.style.element">Average</td>
                    <td v-for="set in props.data" :key="set.name" :style="state.style.element">{{ getAverage(set) }}</td>
                </tr>
            </tbody>
        </v-table>
        <v-table 
            v-else
            fixed-header
            density="compact"
        >
            <thead>
                <tr>
                    <th :style="state.style.header">
                        Name
                    </th>
                    <th v-for="level in state.levels" :key="level" :style="state.style.header">{{ level }}</th>
                    <th :style="state.style.header">Average</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="set in props.data"
                    :key="set.name"
                >
                    <td :style="state.style.element">
                        <div style="display: inline-block">{{set.name}}</div> <div :style="getSwatchStyle(set)"></div>
                    </td>
                    <td v-for="level in state.levels" :key="level" :style="state.style.element">{{ getDataForElement(set, level) }}</td>
                    <td :style="state.style.element">{{ getAverage(set) }}</td>
                </tr>
            </tbody>
        </v-table>
    </div>
</template>

<script setup lang="ts">
    import { DataSet } from '../model/utility/types';
    import { reactive, computed } from "vue";
    import Util from '../model/utility/util';
    
    const props = defineProps<{
        data: DataSet[],
        mode: 'raw' | 'red' | 'accuracy',
        horizontal: boolean
    }>()

    const state = reactive({
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        style: {
            header: {
                textAlign: 'center' as const,
                padding: '0px 4px',
                fontWeight: 700
            },
            element: {
                textAlign: 'center' as const,
                padding: '0px 4px',
                border: '0.5px solid black',
                borderCollapse: 'collapse' as const
            }
        }
    })

    const title = computed(() => {
        if (props.mode == 'raw') { return 'Raw DPR'}
        else if (props.mode == 'red') { return 'DPR (scaled by RED)'}
        else { return 'Accuracy (%)'}
    })

    function getSwatchStyle(element: DataSet) : any {
        return {
            display: 'inline-block',
            backgroundColor: element.color,
            height: '10px',
            width: '10px'
        }
    }

    function getDataForElement(element: DataSet, level: number): number | string {
        let datum: number | null = null;
        switch(props.mode) {
            case 'raw':
                datum = element.raw[(level as number) - 1]
                break;
            case 'red':
                datum = element.red[(level as number) - 1]
                break;
            case 'accuracy':
                datum = 100 * element.accuracy[(level as number) - 1]
                break;
        }
        if (datum) {
            return Util.round(datum, 2);
        } else {
            return 'N/A'
        }
    }

    function getAverage(element: DataSet) : number {
        if (props.mode == 'raw') { return Util.round(Util.average(element.raw.filter(x=> x != null)))}
        else if (props.mode == 'red') { return Util.round(Util.average(element.red.filter(x => x!= null)))}
        else { return Util.round(100*Util.average(element.accuracy.filter(x => x != null)))}
    }
</script>