<template>
    <v-tooltip activator="parent" :location="props.location">
        <p v-for="str in summary">
            {{ str }}
        </p>
    </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ClassEntity } from '../model/classes/ClassEntity';

    const props = defineProps<{
        location: string,
        item: ClassEntity
    }>()

    const summary = ref(props.item.getSummary());

</script>