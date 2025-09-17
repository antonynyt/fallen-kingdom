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
        v-else-if="gameState === 'playing'"
        :current-npc="currentNPC"
        :popularity="popularity"
        :turn="currentTurn"
        @choice-made="handleChoice"
      />
      
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
import { ref, computed } from 'vue'
import ApiKeyConfig from './ApiKeyConfig.vue'
import IntroScreen from './IntroScreen.vue'
import GameScreen from './GameScreen.vue'
import EndScreen from './EndScreen.vue'
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

const { generateNPCContent } = useAI()

const currentNPC = ref(null)
const endingType = ref('') // 'rebellion', 'victory', 'neutral'

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
  
  // Generate dynamic content with AI
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value)
  currentNPC.value = enhancedNPC
}

const handleChoice = async (choice) => {
  const result = processChoice(choice, currentNPC.value)
  
  // Add action to history
  addAction({
    turn: currentTurn.value,
    npc: currentNPC.value.id,
    choice: choice,
    popularityChange: result.popularityChange
  })
  
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
</style>
