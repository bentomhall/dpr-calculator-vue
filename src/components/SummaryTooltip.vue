<template>
    <v-tooltip activator="parent" :location="props.location">
        <p v-for="str in props.item.getSummary()">
            {{ str }}
        </p>
    </v-tooltip>
</template>

<script setup lang="ts">
import { ClassEntity } from '../model/classes/ClassEntity';

    const props = defineProps<{
        location: string,
        item: ClassEntity,
    }>()

</script>