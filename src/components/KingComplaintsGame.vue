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
        :is-ai-generated="isCurrentNPCAIGenerated"
        @choice-made="handleChoice"
      />
      
      <!-- Narrator Response Overlay -->
      <div v-if="showingNarratorResponse" class="narrator-overlay">
        <div class="narrator-content">
          <h3 class="narrator-title">The Kingdom Reacts</h3>
          <p class="narrator-text">{{ currentNarratorText }}</p>
          <div class="narrator-actions">
            <GameButton @click="continueGame" class="continue-button">
              Continue
            </GameButton>
            <div class="countdown-timer">
              Auto-continue in {{ narratorCountdown }}s
            </div>
          </div>
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
const isCurrentNPCAIGenerated = ref(false)
const nextNPCReady = ref(null) // Store the next NPC while narrator is showing
const narratorTimer = ref(null)
const narratorCountdown = ref(10)

const currentBackground = computed(() => {
  if (gameState.value === 'intro') return '/images/backgrounds/throne-room.jpg'
  if (gameState.value === 'ended') return '/images/backgrounds/ending.svg'
  return currentNPC.value?.background || '/images/backgrounds/throne-room.jpg'
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
  
  // Track if we have an API key for AI generation
  const hasAI = hasApiKey()
  
  // Generate dynamic content with AI
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value)
  currentNPC.value = enhancedNPC
  
  // Track if this content was AI-generated (has API key and enhanced content differs from original)
  isCurrentNPCAIGenerated.value = hasAI && (
    enhancedNPC.dialogue !== npcData.dialogue || 
    JSON.stringify(enhancedNPC.choices) !== JSON.stringify(npcData.choices)
  )
}

const handleChoice = async (choice) => {
  const result = processChoice(choice, currentNPC.value)
  
  // Add action to history first
  addAction({
    turn: currentTurn.value,
    npc: currentNPC.value.id,
    choice: choice,
    popularityChange: result.popularityChange
  })
  
  // Show narrator response
  currentNarratorText.value = choice.narratorResponse || generateDefaultNarrator(choice, result)
  showingNarratorResponse.value = true
  
  // Clear any existing timer
  if (narratorTimer.value) {
    clearTimeout(narratorTimer.value)
  }
  
  // Start countdown
  narratorCountdown.value = 5
  
  // Start loading next NPC in background
  loadNextNPCInBackground()
  
  // Countdown timer
  const countdownInterval = setInterval(() => {
    narratorCountdown.value--
    if (narratorCountdown.value <= 0) {
      clearInterval(countdownInterval)
      continueGame()
    }
  }, 1000)
  
  // Store interval reference for cleanup
  narratorTimer.value = countdownInterval
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

const loadNextNPCInBackground = async () => {
  // Check game over conditions first
  if (popularity.value <= 0 || currentTurn.value >= 15) {
    nextNPCReady.value = null
    return
  }
  
  const npcData = getCurrentNPC(currentTurn.value)
  if (!npcData) {
    nextNPCReady.value = null
    return
  }
  
  console.log('Background loading NPC:', npcData.name, 'AI configured:', apiConfigured.value)
  
  // Track if we have an API key for AI generation
  const hasAI = hasApiKey()
  
  // Generate dynamic content with AI in background
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value)
  
  // Store the ready NPC with AI status
  nextNPCReady.value = {
    npc: enhancedNPC,
    isAiGenerated: hasAI && (
      enhancedNPC.dialogue !== npcData.dialogue || 
      JSON.stringify(enhancedNPC.choices) !== JSON.stringify(npcData.choices)
    )
  }
  
  console.log('Background NPC ready:', nextNPCReady.value.npc.name)
}

const continueGame = async () => {
  // Clear the timer/interval
  if (narratorTimer.value) {
    clearInterval(narratorTimer.value)
    narratorTimer.value = null
  }
  
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
  
  // Use pre-loaded NPC if available, otherwise load normally
  if (nextNPCReady.value) {
    console.log('Using pre-loaded NPC:', nextNPCReady.value.npc.name)
    currentNPC.value = nextNPCReady.value.npc
    isCurrentNPCAIGenerated.value = nextNPCReady.value.isAiGenerated
    nextNPCReady.value = null
  } else {
    console.log('Pre-loaded NPC not ready, loading normally')
    await loadNextNPC()
  }
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

.narrator-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.countdown-timer {
  color: #aaa;
  font-size: 0.9rem;
  font-style: italic;
}
</style>
