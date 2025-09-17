<template>
  <div class="game-container">
    <!-- API Configuration -->
    <ApiKeyConfig 
      v-if="!apiConfigured"
      @configured="apiConfigured = true"
    />
    
    <!-- Background Image -->
    <div class="background-image" :style="{ backgroundImage: `url(${currentBackground})` }">
      <!-- Atmospheric Effects -->
      <div class="vignette"></div>
      <div class="film-grain"></div>
      
      <!-- Intro Screen -->
      <IntroScreen
        v-if="gameState === 'intro'"
        @start-game="startGame"
      />
      
      <!-- Main Game Screen -->
      <GameScreen
        v-else-if="gameState === 'playing' && !showingNarratorResponse"
        :current-npc="currentNPC"
        :popularity="popularity"
        :turn="currentTurn"
        @choice-made="handleChoice"
      />
      
      <!-- Narrator Response Overlay -->
      <div v-if="showingNarratorResponse" class="narrator-overlay">
        <div class="narrator-content">
          <h3 class="narrator-title">The Kingdom Reacts</h3>
          <p class="narrator-text">{{ currentNarratorText }}</p>
          <GameButton @click="continueGame" class="continue-button">
            Continue
          </GameButton>
        </div>
      </div>
      
      <!-- End Screen -->
      <EndScreen
        v-else-if="gameState === 'ended'"
        :popularity="popularity"
        :ending-type="endingType"
        @restart="restart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ApiKeyConfig from './ApiKeyConfig.vue'
import IntroScreen from './IntroScreen.vue'
import GameScreen from './GameScreen.vue'
import EndScreen from './EndScreen.vue'
import GameButton from './GameButton.vue'
import { useGameState } from '../composables/useGameState'
import { useAI } from '../composables/useAI'

const apiConfigured = ref(false)
const gameState = ref('intro') // 'intro', 'playing', 'ended'
const { 
  popularity, 
  currentTurn, 
  actionHistory, 
  addAction, 
  resetGame,
  getCurrentNPC,
  processChoice
} = useGameState()

const { generateNPCContent, hasApiKey } = useAI()

// Check if API is already configured on mount
onMounted(() => {
  apiConfigured.value = hasApiKey()
})

const currentNPC = ref(null)
const endingType = ref('') // 'rebellion', 'victory', 'neutral'
const showingNarratorResponse = ref(false)
const currentNarratorText = ref('')

const currentBackground = computed(() => {
  if (gameState.value === 'intro') return '/images/backgrounds/throne-room.svg'
  if (gameState.value === 'ended') return '/images/backgrounds/ending.svg'
  return currentNPC.value?.background || '/images/backgrounds/throne-room.svg'
})

const startGame = async () => {
  gameState.value = 'playing'
  await loadNextNPC()
}

const loadNextNPC = async () => {
  const npcData = getCurrentNPC(currentTurn.value)
  if (!npcData) {
    endGame('victory')
    return
  }
  
  console.log('Loading NPC:', npcData.name, 'AI configured:', apiConfigured.value)
  
  // Generate dynamic content with AI
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value)
  currentNPC.value = enhancedNPC
}

const handleChoice = async (choice) => {
  const result = processChoice(choice, currentNPC.value)
  
  // Show narrator response
  currentNarratorText.value = choice.narratorResponse || generateDefaultNarrator(choice, result)
  showingNarratorResponse.value = true
  
  // Add action to history
  addAction({
    turn: currentTurn.value,
    npc: currentNPC.value.id,
    choice: choice,
    popularityChange: result.popularityChange
  })
}

const generateDefaultNarrator = (choice, result) => {
  if (result.popularityChange > 5) {
    return "Your wise decision strengthens the kingdom's unity."
  } else if (result.popularityChange < -5) {
    return "Whispers of discontent spread through the realm."
  } else {
    return "The kingdom watches and waits for your next move."
  }
}

const continueGame = async () => {
  showingNarratorResponse.value = false
  
  // Check game over conditions
  if (popularity.value <= 0) {
    endGame('rebellion')
    return
  }
  
  if (currentTurn.value >= 15) {
    endGame(popularity.value >= 70 ? 'victory' : 'neutral')
    return
  }
  
  // Load next NPC
  await loadNextNPC()
}

const endGame = (type) => {
  endingType.value = type
  gameState.value = 'ended'
}

const restart = () => {
  resetGame()
  gameState.value = 'intro'
  currentNPC.value = null
  endingType.value = ''
}
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: background-image 1s ease-in-out;
}

.vignette {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%);
}

.film-grain {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.1) 2px,
      rgba(255,255,255,0.1) 4px
    );
}

.narrator-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.narrator-content {
  background: rgba(20, 20, 30, 0.95);
  padding: 3rem;
  border-radius: 15px;
  border: 2px solid #ffd700;
  max-width: 600px;
  text-align: center;
}

.narrator-title {
  color: #ffd700;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.narrator-text {
  color: #e0e0e0;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-style: italic;
}

.continue-button {
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  font-weight: bold;
}
</style>
