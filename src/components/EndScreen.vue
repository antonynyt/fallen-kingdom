<template>
  <div class="end-screen">
    <div class="end-overlay">
      <div class="end-content">
        <h1 class="end-title">{{ endTitle }}</h1>
        <div class="end-text">
          <p>{{ endDescription }}</p>
          <p class="final-popularity">Final Popularity: {{ popularity }}%</p>
        </div>
        <GameButton @click="$emit('restart')" class="restart-button">
          Play Again
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameButton from './GameButton.vue'

const props = defineProps({
  popularity: Number,
  endingType: String
})

defineEmits(['restart'])

const endTitle = computed(() => {
  switch (props.endingType) {
    case 'rebellion':
      return 'The People Have Risen!'
    case 'victory':
      return 'A Glorious Reign!'
    case 'neutral':
      return 'A Mixed Legacy'
    default:
      return 'The End'
  }
})

const endDescription = computed(() => {
  switch (props.endingType) {
    case 'rebellion':
      return 'Your popularity fell too low and the people have revolted. Your reign has come to a violent end. Perhaps different choices could have saved your throne...'
    case 'victory':
      return 'You have successfully restored honor to the crown! The people love you and your kingdom prospers. You are remembered as a wise and just ruler.'
    case 'neutral':
      return 'Your reign was neither triumphant nor catastrophic. Some respect you, others question your decisions. History will be the final judge of your legacy.'
    default:
      return 'Your story has ended.'
  }
})
</script>

<style scoped>
.end-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-overlay {
  background: rgba(0, 0, 0, 0.8);
  padding: 3rem;
  border-radius: 10px;
  max-width: 800px;
  text-align: center;
}

.end-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  color: #ff4444;
}

.end-screen[data-ending="victory"] .end-title {
  color: #44ff44;
}

.end-screen[data-ending="neutral"] .end-title {
  color: #ffff44;
}

.end-text {
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.end-text p {
  margin-bottom: 1rem;
}

.final-popularity {
  font-weight: bold;
  font-size: 1.4rem;
  color: #ffd700;
}

.restart-button {
  font-size: 1.3rem;
  padding: 1rem 2rem;
}
</style>
