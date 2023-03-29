<template>
    <Line :data="chartData" :options="state.options" />
</template>

<script setup lang="ts">
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        CategoryScale,
        PointElement,
    } from "chart.js"
    import {Line} from 'vue-chartjs'
    import { reactive, computed } from "vue";
    import { DataSet } from "../model/utility/types";
    const props = defineProps<{
        data: DataSet[],
        mode: string
    }>()

    const chartData = computed(() => {
        return {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            datasets: props.data.map(el => {
                let d: number[];
                if (props.mode == 'raw') {
                    d = el.raw
                } else if (props.mode == 'red') {
                    d = el.red
                } else {
                    d = el.accuracy
                }
                return {
                    data: d,
                    borderColor: el.color,
                    label: el.name,
                    fill: false,
                    tension: 0.1
                }
            })
        }
    })
    const state = reactive({ 
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    grace: 1
                }
            },
            spanGaps: false
        }
    });
    ChartJS.register(LinearScale, LineElement, Title, Tooltip, Legend, CategoryScale, PointElement)
</script>