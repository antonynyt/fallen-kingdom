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
            View Characters
          </button>
        </div>
        <div class="turn-counter">Turn {{ turn }}/5</div>
      </div>
    </div>

    <!-- Dialogue Area at Bottom -->
    <div class="dialogue-area">
      <div class="character-dialogue-section">
        <div class="character-portrait">
          <img v-if="currentNpc" :src="currentNpc.image" :alt="currentNpc.name" class="main-character-image" />
        </div>
        <div class="dialogue-section">
          <DialogueBubble
            v-if="currentNpc"
            :speaker="currentNpc.name"
            :text="currentDialogue"
            :character-image="null"
            :summary="currentNpc.summary"
          />
        </div>
      </div>
      
      <div v-if="showChoices" class="choices-section">
        <div class="choices-container">
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
  background: rgba(255, 222, 169, 0.8);
  color: #3e2a0f;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-actions {
  display: flex;
  gap: 1rem;
}

.characters-button {
  background: #3e2a0f;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.characters-button:hover {
  background: #2d1f08;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(62, 42, 15, 0.3);
}

.popularity-meter {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  font-weight: 500;
}

.meter {
  width: 180px;
  height: 20px;
  background: rgb(255 252 246);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #3e2a0f;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #3e2a0f 0%, #5a3c18 100%);
  transition: width 0.5s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.turn-counter {
  font-weight: bold;
  font-size: 1.4rem;
}

.dialogue-area {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-end;
  height: auto;
}

.character-dialogue-section {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 1rem;
  flex: 1;
  max-width: 50%;
}

.character-portrait {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.main-character-image {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #ffd700;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
}

.dialogue-section {
  width: 100%;
}

.choices-section {
  position: fixed;
  right: 20px;
  bottom: 20px;
  overflow-y: auto;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  /* padding: 1rem 1.5rem; */
  /* background: rgba(0, 0, 0, 0.7); */
  /* border-radius: 10px; */
  /* backdrop-filter: blur(8px); */
  /* border: 1px solid rgba(255, 215, 0, 0.3); */
}
</style>
