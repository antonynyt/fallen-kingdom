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
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  padding: 1.2rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.choice-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
}

.choice-button.positive:hover {
  border-color: #44ff44;
  box-shadow: 0 0 8px rgba(68, 255, 68, 0.3);
}

.choice-button.negative:hover {
  border-color: #ff4444;
  box-shadow: 0 0 8px rgba(255, 68, 68, 0.3);
}

.choice-text {
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
  font-weight: 500;
  line-height: 1.4;
}

.choice-consequence {
  font-size: 1.2rem;
  color: #cccccc;
  font-style: italic;
  line-height: 1.4;
}
</style>
