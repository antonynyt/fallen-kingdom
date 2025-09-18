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
        <div class="status-actions">
          <button class="characters-button" @click="showCharacterStatus = true" title="View Characters">
            👥 Characters
          </button>
        </div>
        <div class="turn-counter">Turn {{ turn }}/8</div>
      </div>
    </div>

    <!-- Dialogue Area at Bottom -->
    <div class="dialogue-area">
      <DialogueBubble
        v-if="currentNpc"
        :speaker="currentNpc.name"
        :text="currentDialogue"
        :character-image="currentNpc.image"
        :summary="currentNpc.summary"
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

    <!-- Character Status Panel -->
    <CharacterStatus
      :visible="showCharacterStatus"
      :characters="characters"
      @close="showCharacterStatus = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DialogueBubble from './DialogueBubble.vue'
import ChoiceButton from './ChoiceButton.vue'
import CharacterStatus from './CharacterStatus.vue'

const props = defineProps({
  currentNpc: Object,
  popularity: Number,
  turn: Number,
  isAiGenerated: Boolean,  // Add prop to indicate if content is AI-generated
  characters: Array  // Add characters prop
})

const emit = defineEmits(['choice-made'])

const currentDialogue = ref('')
const showChoices = ref(false)
const dialogueIndex = ref(0)
const isStreaming = ref(false)
const currentAnimationId = ref(0) // Track animation instances
const showCharacterStatus = ref(false)

const typewriterSpeed = 10 // milliseconds per character

const typeText = async (text, useStreaming = false) => {
  // Increment animation ID to cancel any previous animations
  const animationId = ++currentAnimationId.value
  
  // Reset state immediately
  currentDialogue.value = ''
  showChoices.value = false
  isStreaming.value = useStreaming
  
  // Ensure text is a valid string and handle any encoding issues
  const cleanText = String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Convert to array to properly handle Unicode characters for both modes
  const characters = Array.from(cleanText)
  
  // Use letter-by-letter for both AI and static content
  // AI content types slightly faster for a more dynamic feel
  const speed = useStreaming ? 30 : typewriterSpeed // AI: 30ms, Static: 50ms
  
  for (let i = 0; i < characters.length; i++) {
    // Check if this animation was cancelled by a newer one
    if (currentAnimationId.value !== animationId) return
    
    currentDialogue.value += characters[i]
    await new Promise(resolve => setTimeout(resolve, speed))
  }
  
  // Check if still the current animation before showing choices
  if (currentAnimationId.value === animationId) {
    const delay = useStreaming ? 200 : 500 // Shorter delay for AI content
    setTimeout(() => {
      if (currentAnimationId.value === animationId) {
        showChoices.value = true
        isStreaming.value = false
      }
    }, delay)
  }
}

const makeChoice = (choice) => {
  showChoices.value = false
  emit('choice-made', choice)
}

// Watch for NPC changes
onMounted(() => {
  if (props.currentNpc?.dialogue) {
    typeText(props.currentNpc.dialogue, props.isAiGenerated)
  }
})

// Re-run when NPC changes
const prevNpc = ref(null)
const prevDialogue = ref('')

const checkNpcChange = () => {
  if (props.currentNpc && 
      (props.currentNpc !== prevNpc.value || 
       props.currentNpc.dialogue !== prevDialogue.value)) {
    
    prevNpc.value = props.currentNpc
    prevDialogue.value = props.currentNpc.dialogue
    
    if (props.currentNpc.dialogue) {
      typeText(props.currentNpc.dialogue, props.isAiGenerated)
    }
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

.status-actions {
  display: flex;
  gap: 1rem;
}

.characters-button {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #ffd700;
  color: #ffd700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.characters-button:hover {
  background: rgba(255, 215, 0, 0.4);
  color: white;
  transform: translateY(-1px);
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
  bottom: 10px;
  left: 10px;
  right: 10px;
  border-radius: 20px;
  overflow: hidden;
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
