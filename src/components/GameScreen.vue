<template>
  <div class="game-screen">
    <!-- Game UI Overlay -->
    <div class="game-ui">
      <!-- Status Bar -->
      <div class="status-bar">
        <div class="popularity-meter">
          <span>Popularity: {{ popularity }}%</span>
          <div class="meter">
            <div class="meter-fill" :style="{ width: popularity + '%' }"></div>
          </div>
        </div>
        <div class="turn-counter">Turn {{ turn }}/15</div>
      </div>
    </div>

    <!-- Dialogue Area at Bottom -->
    <div class="dialogue-area">
      <DialogueBubble
        v-if="currentNpc"
        :speaker="currentNpc.name"
        :text="currentDialogue"
        :character-image="currentNpc.image"
      />
      
      <div v-if="showChoices" class="choices-container">
        <ChoiceButton
          v-for="(choice, index) in currentNpc.choices"
          :key="index"
          :text="choice.text"
          :consequence="choice.consequence"
          @click="makeChoice(choice)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DialogueBubble from './DialogueBubble.vue'
import ChoiceButton from './ChoiceButton.vue'

const props = defineProps({
  currentNpc: Object,
  popularity: Number,
  turn: Number
})

const emit = defineEmits(['choice-made'])

const currentDialogue = ref('')
const showChoices = ref(false)
const dialogueIndex = ref(0)

const typewriterSpeed = 50 // milliseconds per character

const typeText = async (text) => {
  currentDialogue.value = ''
  showChoices.value = false
  
  for (let i = 0; i < text.length; i++) {
    currentDialogue.value += text[i]
    await new Promise(resolve => setTimeout(resolve, typewriterSpeed))
  }
  
  // Show choices after dialogue is complete
  setTimeout(() => {
    showChoices.value = true
  }, 500)
}

const makeChoice = (choice) => {
  showChoices.value = false
  emit('choice-made', choice)
}

// Watch for NPC changes
onMounted(() => {
  if (props.currentNpc) {
    typeText(props.currentNpc.dialogue)
  }
})

// Watch for NPC changes in reactive way
const currentNpc = computed(() => props.currentNpc)
const watchNpc = () => {
  if (currentNpc.value) {
    typeText(currentNpc.value.dialogue)
  }
}

// Re-run when NPC changes
const prevNpc = ref(null)
const checkNpcChange = () => {
  if (currentNpc.value && currentNpc.value !== prevNpc.value) {
    prevNpc.value = currentNpc.value
    typeText(currentNpc.value.dialogue)
  }
}

// Use a watcher alternative
const interval = setInterval(checkNpcChange, 100)

// Cleanup
onMounted(() => {
  return () => clearInterval(interval)
})
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.popularity-meter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meter {
  width: 200px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444 0%, #ffff44 50%, #44ff44 100%);
  transition: width 0.5s ease;
}

.turn-counter {
  font-weight: bold;
  font-size: 1.2rem;
}

.dialogue-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
}
</style>
