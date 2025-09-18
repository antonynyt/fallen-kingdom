<template>
  <div class="game-container">
    <!-- Background Music -->
    <audio 
      ref="backgroundMusic"
      :src="'/audio/background-music.mp3'"
      loop
      preload="auto"
      :volume="musicVolume"
    ></audio>
    
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
        :characters="getAllCharacters()"
        @choice-made="handleChoice"
      />
      
      <!-- Enhanced Narrator Response Overlay -->
      <NarratorResponse
        v-if="showingNarratorResponse"
        :consequence-data="lastChoiceConsequence"
        :character-actions="lastCharacterActions"
        :narrator-text="currentNarratorText"
        :story-theme-changes="storyThemeChanges"
        :new-story-arcs="newStoryArcs"
        :countdown="narratorCountdown"
        @continue="continueGame"
      />
      
      <!-- End Screen -->
      <EndScreen
        v-else-if="gameState === 'ended'"
        :popularity="popularity"
        :ending-type="endingType"
        :action-history="actionHistory"
        :characters="getAllCharacters()"
        @restart="restart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ApiKeyConfig from './ApiKeyConfig.vue'
import IntroScreen from './IntroScreen.vue'
import GameScreen from './GameScreen.vue'
import EndScreen from './EndScreen.vue'
import GameButton from './GameButton.vue'
import NarratorResponse from './NarratorResponse.vue'
import { useGameState } from '../composables/useGameState'
import { useAI } from '../composables/useAI'

const apiConfigured = ref(false)
const gameState = ref('intro') // 'intro', 'playing', 'ended'
const backgroundMusic = ref(null)
const musicVolume = ref(0.3) // Adjust volume (0.0 to 1.0)
const isMusicPlaying = ref(false)
const { 
  popularity, 
  currentTurn, 
  actionHistory, 
  characters,
  storyThemes,
  storyArcs,
  activeConflicts,
  worldEvents,
  addAction, 
  resetGame,
  getCurrentNPC,
  processChoice,
  addAIGeneratedCharacter,
  getAllCharacters,
  executeImmediateCharacterActions,
  executeChoiceCharacterActions,
  getStoryState,
  getDominantTheme
} = useGameState()

const { generateNPCContent, hasApiKey } = useAI()

// Check if API is already configured on mount
onMounted(() => {
  apiConfigured.value = hasApiKey()
  
  // Initialize background music
  if (backgroundMusic.value) {
    backgroundMusic.value.addEventListener('canplaythrough', () => {
      console.log('Background music loaded')
    })
    
    backgroundMusic.value.addEventListener('error', (e) => {
      console.error('Error loading background music:', e)
    })
  }
})

onUnmounted(() => {
  // Clean up audio when component is destroyed
  if (backgroundMusic.value) {
    backgroundMusic.value.pause()
    backgroundMusic.value.currentTime = 0
  }
})

const currentNPC = ref(null)
const endingType = ref('') // 'rebellion', 'victory', 'neutral'
const showingNarratorResponse = ref(false)
const currentNarratorText = ref('')
const isCurrentNPCAIGenerated = ref(false)
const nextNPCReady = ref(null) // Store the next NPC while narrator is showing
const narratorTimer = ref(null)
const narratorCountdown = ref(10)

// New reactive properties for enhanced narrator
const lastChoiceConsequence = ref({
  type: 'neutral', // 'death', 'rebellion', 'positive', 'neutral'
  popularityChange: 0,
  severity: 'low' // 'low', 'medium', 'high', 'extreme'
})
const lastCharacterActions = ref([])
const storyThemeChanges = ref([])
const newStoryArcs = ref([])
const previousStoryState = ref(null)

const currentBackground = computed(() => {
  if (gameState.value === 'intro') return '/images/backgrounds/throne-room.jpg'
  if (gameState.value === 'ended') return '/images/backgrounds/ending.svg'
  
  // Check for low popularity and show rebellion background
  if (popularity.value < 40 && popularity.value >= 30) {
    return '/images/backgrounds/crowd-rebelion.jpg'
  }

  if (popularity.value < 30) {
    return '/images/backgrounds/crowd-rebelion2.jpg'
  }
  
  return currentNPC.value?.background || '/images/backgrounds/throne-room.jpg'
})

const startGame = async () => {
  gameState.value = 'playing'
  previousStoryState.value = getStoryState()
  
  // Start background music when game starts
  startBackgroundMusic()
  
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
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value, characters.value)
  currentNPC.value = enhancedNPC
  
  // Track if this content was AI-generated (has API key and enhanced content differs from original)
  isCurrentNPCAIGenerated.value = hasAI && (
    enhancedNPC.dialogue !== npcData.dialogue || 
    JSON.stringify(enhancedNPC.choices) !== JSON.stringify(npcData.choices)
  )

  // If this is a new AI-generated character, add it to the tracking system
  if (isCurrentNPCAIGenerated.value && enhancedNPC.id !== npcData.id) {
    addAIGeneratedCharacter(enhancedNPC)
  }

  // Execute immediate character actions (if any)
  const immediateActions = executeImmediateCharacterActions(enhancedNPC)
  if (immediateActions.length > 0) {
    console.log('Executing immediate character actions:', immediateActions)
    // You could show these actions to the player here if needed
  }
}

const handleChoice = async (choice) => {
  const result = processChoice(choice, currentNPC.value)
  const choiceIndex = currentNPC.value.choices?.findIndex(c => c.text === choice.text) ?? -1
  
  // Store previous state for comparison
  const prevStoryState = { ...getStoryState() }
  const prevStoryArcsCount = storyArcs.value.length
  
  // Execute choice-triggered character actions
  const characterActions = executeChoiceCharacterActions(currentNPC.value, choiceIndex)
  lastCharacterActions.value = characterActions
  
  // Analyze consequence type and severity
  analyzeConsequences(choice, result, characterActions)
  
  // Detect story changes
  detectStoryChanges(prevStoryState)
  
  // Enhanced narrator text with character actions
  if (characterActions.length > 0) {
    const actionDescriptions = characterActions.map(action => formatActionDescription(action)).join('. ')
    const originalNarrator = choice.narratorResponse || generateDefaultNarrator(choice, result)
    currentNarratorText.value = `${originalNarrator} ${actionDescriptions}`
  } else {
    currentNarratorText.value = choice.narratorResponse || generateDefaultNarrator(choice, result)
  }
  
  // Add action to history 
  addAction({
    turn: currentTurn.value,
    npc: currentNPC.value.id,
    choice: choice,
    popularityChange: result.popularityChange,
    characterActions: characterActions
  })
  
  showingNarratorResponse.value = true
  
  // Clear any existing timer
  if (narratorTimer.value) {
    clearTimeout(narratorTimer.value)
  }
  
  // Start countdown (longer for more severe consequences)
  const baseTime = lastChoiceConsequence.value.severity === 'extreme' ? 15 : 
                   lastChoiceConsequence.value.severity === 'high' ? 12 : 10
  narratorCountdown.value = baseTime
  
  // Start loading next NPC in background
  loadNextNPCInBackground()
  
  // Countdown timer for button enabling only (no auto-continue)
  const countdownInterval = setInterval(() => {
    narratorCountdown.value--
    if (narratorCountdown.value <= 0) {
      clearInterval(countdownInterval)
      narratorTimer.value = null
    }
  }, 1000)
  
  narratorTimer.value = countdownInterval
}

const analyzeConsequences = (choice, result, characterActions) => {
  let severity = 'low'
  let type = 'neutral'
  
  // Check for deaths
  const deaths = characterActions.filter(a => a.type === 'death')
  if (deaths.length > 0) {
    type = 'death'
    severity = deaths.length > 1 ? 'extreme' : 'high'
  }
  
  // Check for rebellions/major conflicts
  const conflicts = characterActions.filter(a => a.reason?.toLowerCase().includes('rebellion') || 
                                                 a.reason?.toLowerCase().includes('revolt'))
  if (conflicts.length > 0) {
    type = 'rebellion'
    severity = 'extreme'
  }
  
  // Check popularity changes
  const popChange = Math.abs(result.popularityChange)
  if (popChange >= 15) {
    severity = 'extreme'
    type = result.popularityChange > 0 ? 'positive' : 'negative'
  } else if (popChange >= 10) {
    severity = 'high'
    type = result.popularityChange > 0 ? 'positive' : 'negative'
  } else if (popChange >= 5) {
    severity = 'medium'
  }
  
  // Check for multiple character actions
  if (characterActions.length > 2) {
    severity = severity === 'low' ? 'medium' : severity
  }
  
  lastChoiceConsequence.value = {
    type,
    popularityChange: result.popularityChange,
    severity
  }
}

const detectStoryChanges = (prevState) => {
  const currentState = getStoryState()
  
  // Detect theme changes
  storyThemeChanges.value = []
  Object.keys(currentState.themes).forEach(theme => {
    const prev = prevState.themes[theme] || 0
    const current = currentState.themes[theme] || 0
    const diff = Math.abs(current - prev)
    
    if (diff >= 2) {
      storyThemeChanges.value.push({
        theme: theme.charAt(0).toUpperCase() + theme.slice(1),
        direction: current > prev ? 'increase' : 'decrease',
        amount: Math.round(diff)
      })
    }
  })
  
  // Detect new story arcs
  newStoryArcs.value = currentState.arcs.filter(arc => 
    !prevState.arcs.some(prevArc => prevArc.type === arc.type)
  )
}

const formatActionDescription = (action) => {
  const icon = getActionIcon(action.type)
  switch (action.type) {
    case 'death': return `${icon} ${action.characterName} has perished: ${action.reason}`
    case 'create': return `${icon} ${action.characterName} (${action.characterRole}) emerges: ${action.reason}`
    case 'exile': return `${icon} ${action.characterName} has been banished: ${action.reason}`
    case 'modify': return `${icon} ${action.characterName} changes: ${action.reason}`
    default: return `${icon} ${action.characterName}: ${action.reason}`
  }
}

const getActionIcon = (actionType) => {
  switch (actionType) {
    case 'death': return '💀'
    case 'create': return '👤'
    case 'exile': return '🚪'
    case 'modify': return '🔄'
    default: return '⚡'
  }
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
  if (popularity.value <= 0 || currentTurn.value >= 5) {
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
  const enhancedNPC = await generateNPCContent(npcData, actionHistory.value, characters.value)
  
  // Store the ready NPC with AI status
  nextNPCReady.value = {
    npc: enhancedNPC,
    isAiGenerated: hasAI && (
      enhancedNPC.dialogue !== npcData.dialogue || 
      JSON.stringify(enhancedNPC.choices) !== JSON.stringify(npcData.choices)
    )
  }

  // If this is a new AI-generated character, add it to the tracking system
  const isAIGenerated = nextNPCReady.value.isAiGenerated && enhancedNPC.id !== npcData.id
  if (isAIGenerated) {
    addAIGeneratedCharacter(enhancedNPC)
  }

  // Pre-process immediate character actions for the ready NPC
  const immediateActions = executeImmediateCharacterActions(enhancedNPC)
  if (immediateActions.length > 0) {
    console.log('Pre-processing immediate character actions for background NPC:', immediateActions)
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
  
  // Reset consequence tracking
  lastCharacterActions.value = []
  storyThemeChanges.value = []
  newStoryArcs.value = []
  
  // Check game over conditions
  if (popularity.value <= 0) {
    endGame('rebellion')
    return
  }
  
  if (currentTurn.value >= 5) {
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
  lastChoiceConsequence.value = { type: 'neutral', popularityChange: 0, severity: 'low' }
  lastCharacterActions.value = []
  storyThemeChanges.value = []
  newStoryArcs.value = []
  
  // Stop music on restart
  stopBackgroundMusic()
}

const startBackgroundMusic = async () => {
  if (backgroundMusic.value && !isMusicPlaying.value) {
    try {
      await backgroundMusic.value.play()
      isMusicPlaying.value = true
    } catch (error) {
      console.log('Autoplay prevented - user interaction required:', error)
      // You might want to show a "Click to enable music" button here
    }
  }
}

const stopBackgroundMusic = () => {
  if (backgroundMusic.value && isMusicPlaying.value) {
    backgroundMusic.value.pause()
    backgroundMusic.value.currentTime = 0
    isMusicPlaying.value = false
  }
}

const toggleMusic = () => {
  if (isMusicPlaying.value) {
    stopBackgroundMusic()
  } else {
    startBackgroundMusic()
  }
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
