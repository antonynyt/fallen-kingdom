<template>
  <button 
    class="choice-button"
    @click="$emit('click')"
    :class="{ 'positive': isPositive, 'negative': isNegative }"
  >
    <div class="choice-text">{{ text }}</div>
    <div v-if="consequence" class="choice-consequence">{{ consequence }}</div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: String,
  consequence: String,
  popularityChange: Number
})

defineEmits(['click'])

const isPositive = computed(() => props.popularityChange > 0)
const isNegative = computed(() => props.popularityChange < 0)
</script>

<style scoped>
.choice-button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.choice-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateX(10px);
}

.choice-button.positive:hover {
  border-color: #44ff44;
  box-shadow: 0 0 10px rgba(68, 255, 68, 0.3);
}

.choice-button.negative:hover {
  border-color: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}

.choice-text {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.choice-consequence {
  font-size: 1.1rem;
  color: #cccccc;
  font-style: italic;
}
</style>
