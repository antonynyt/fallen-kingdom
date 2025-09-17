import { ref, computed } from 'vue'
import { gameData } from '../data/gameData.js'

export function useGameState() {
  const popularity = ref(50) // Start at 50%
  const currentTurn = ref(1)
  const actionHistory = ref([])
  const completedNPCs = ref([])

  const addAction = (action) => {
    actionHistory.value.push({
      ...action,
      timestamp: Date.now(),
      popularity: popularity.value
    })
    
    // Update popularity
    popularity.value = Math.max(0, Math.min(100, popularity.value + action.popularityChange))
    
    // Mark NPC as completed
    if (!completedNPCs.value.includes(action.npc)) {
      completedNPCs.value.push(action.npc)
    }
    
    // Advance turn
    currentTurn.value++
  }

  const resetGame = () => {
    popularity.value = 50
    currentTurn.value = 1
    actionHistory.value = []
    completedNPCs.value = []
  }

  const getCurrentNPC = (turn) => {
    const availableNPCs = gameData.npcs.filter(npc => 
      !completedNPCs.value.includes(npc.id) && 
      isNPCAvailable(npc, turn)
    )

    if (availableNPCs.length === 0) return null

    // Choose based on turn or dependencies
    return selectBestNPC(availableNPCs, turn)
  }

  const isNPCAvailable = (npc, turn) => {
    // Check if NPC has prerequisites
    if (npc.prerequisites) {
      return npc.prerequisites.every(prereq => 
        actionHistory.value.some(action => action.npc === prereq)
      )
    }
    
    // Check turn requirements
    if (npc.minTurn && turn < npc.minTurn) return false
    if (npc.maxTurn && turn > npc.maxTurn) return false
    
    return true
  }

  const selectBestNPC = (availableNPCs, turn) => {
    // Prioritize NPCs with turn preferences
    const preferredNPCs = availableNPCs.filter(npc => 
      npc.preferredTurn === turn
    )
    
    if (preferredNPCs.length > 0) {
      return preferredNPCs[0]
    }
    
    // Otherwise, return first available
    return availableNPCs[0]
  }

  const processChoice = (choice, npc) => {
    // Calculate popularity change based on choice and context
    let popularityChange = choice.popularityChange || 0
    
    // Apply context modifiers
    popularityChange = applyContextModifiers(popularityChange, choice, npc)
    
    return {
      popularityChange,
      consequence: choice.consequence
    }
  }

  const applyContextModifiers = (baseChange, choice, npc) => {
    let modifier = 0
    
    // Check for related past actions
    const relatedActions = actionHistory.value.filter(action => 
      isActionRelated(action, npc)
    )
    
    relatedActions.forEach(action => {
      if (action.choice.type === choice.type) {
        // Consistency bonus/penalty
        modifier += choice.type === 'harsh' ? -2 : 2
      }
    })
    
    // Apply popularity-based modifiers
    if (popularity.value < 30) {
      // When unpopular, harsh choices hurt more
      modifier += choice.type === 'harsh' ? -5 : 0
    }
    
    return Math.max(-20, Math.min(20, baseChange + modifier))
  }

  const isActionRelated = (action, npc) => {
    // Check if action affects current NPC
    return npc.relationships?.some(rel => 
      rel.affectedBy?.includes(action.npc)
    ) || false
  }

  const getGameState = () => ({
    popularity: popularity.value,
    turn: currentTurn.value,
    history: actionHistory.value,
    completedNPCs: completedNPCs.value
  })

  const canContinue = computed(() => 
    popularity.value > 0 && currentTurn.value <= 15
  )

  return {
    popularity,
    currentTurn,
    actionHistory,
    addAction,
    resetGame,
    getCurrentNPC,
    processChoice,
    getGameState,
    canContinue
  }
}
