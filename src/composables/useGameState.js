import { ref, computed } from 'vue'
import { gameData } from '../data/gameData.js'

export function useGameState() {
  const popularity = ref(50) // Start at 50%
  const currentTurn = ref(1)
  const actionHistory = ref([])
  const completedNPCs = ref([])
  const characters = ref({}) // Track character affinities and status
  const aiGeneratedCharacters = ref([]) // Store AI-generated characters

  const addAction = (action) => {
    actionHistory.value.push({
      ...action,
      timestamp: Date.now(),
      popularity: popularity.value
    })
    
    // Update popularity
    popularity.value = Math.max(0, Math.min(100, popularity.value + action.popularityChange))
    
    // Update character affinity based on choice
    updateCharacterAffinity(action)
    
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
    characters.value = {}
    aiGeneratedCharacters.value = []
  }

  const getCurrentNPC = (turn) => {
    const availableNPCs = gameData.npcs.filter(npc => 
      !completedNPCs.value.includes(npc.id) && 
      isNPCAvailable(npc, turn)
    )

    if (availableNPCs.length === 0) return null

    // Choose based on turn or dependencies
    const selectedNPC = selectBestNPC(availableNPCs, turn)
    
    // Ensure this NPC is tracked when first encountered
    if (selectedNPC && !characters.value[selectedNPC.id]) {
      characters.value[selectedNPC.id] = {
        id: selectedNPC.id,
        name: selectedNPC.name,
        image: selectedNPC.image || '/images/characters/farmer.svg',
        role: selectedNPC.role,
        affinity: 50,
        status: 'alive',
        encountered: true,
        interactions: [],
        isAIGenerated: false
      }
    }
    
    return selectedNPC
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

  const updateCharacterAffinity = (action) => {
    const npcId = action.npc
    const choiceType = action.choice.type
    const popularityChange = action.popularityChange

    // Initialize character if not exists
    if (!characters.value[npcId]) {
      const npcData = findNPCData(npcId)
      characters.value[npcId] = {
        id: npcId,
        name: npcData?.name || 'Unknown',
        image: npcData?.image || '/images/characters/farmer.svg', // fallback image
        role: npcData?.role || 'Unknown',
        affinity: 50, // Neutral starting point
        status: 'alive',
        encountered: true,
        interactions: []
      }
    }

    // Calculate affinity change based on choice
    let affinityChange = 0
    
    // Base affinity change mirrors popularity change but scaled
    affinityChange = popularityChange * 2
    
    // Character-specific modifiers based on choice type
    const character = characters.value[npcId]
    switch (choiceType) {
      case 'merciful':
        affinityChange += 10
        break
      case 'harsh':
        affinityChange -= 15
        break
      case 'threatening':
        affinityChange -= 20
        break
      case 'diplomatic':
        affinityChange += 5
        break
      case 'protective':
        affinityChange += 8
        break
      case 'dismissive':
        affinityChange -= 12
        break
    }
    
    // Apply affinity change
    character.affinity = Math.max(0, Math.min(100, character.affinity + affinityChange))
    
    // Track interaction
    character.interactions.push({
      turn: currentTurn.value,
      choice: action.choice.text,
      affinityChange,
      timestamp: Date.now()
    })

    // Check for death conditions (very low affinity and harsh choices)
    if (character.affinity <= 10 && (choiceType === 'threatening' || choiceType === 'harsh')) {
      if (Math.random() < 0.3) { // 30% chance of death for very unhappy characters
        character.status = 'dead'
      }
    }
  }

  const findNPCData = (npcId) => {
    // Check static NPCs first
    const staticNPC = gameData.npcs.find(npc => npc.id === npcId)
    if (staticNPC) return staticNPC
    
    // Check AI-generated NPCs
    return aiGeneratedCharacters.value.find(npc => npc.id === npcId)
  }

  const addAIGeneratedCharacter = (npcData) => {
    // Add to AI-generated characters list
    aiGeneratedCharacters.value.push(npcData)
    
    // Initialize in character tracking
    if (!characters.value[npcData.id]) {
      characters.value[npcData.id] = {
        id: npcData.id,
        name: npcData.name,
        image: npcData.image,
        role: npcData.role,
        affinity: 50,
        status: 'alive',
        encountered: true,
        interactions: [],
        isAIGenerated: true
      }
    }
  }

  const getAllCharacters = () => {
    return Object.values(characters.value)
  }

  const getCharacterById = (id) => {
    return characters.value[id]
  }

  const processCharacterActions = (characterActions, choiceIndex = -1) => {
    if (!characterActions || !Array.isArray(characterActions)) return []

    const processedActions = []

    characterActions.forEach(action => {
      // Only process actions for immediate execution or matching choice
      if (action.triggerChoice !== -1 && action.triggerChoice !== choiceIndex) {
        return
      }

      switch (action.type) {
        case 'death':
          if (action.characterId && characters.value[action.characterId]) {
            characters.value[action.characterId].status = 'dead'
            characters.value[action.characterId].deathReason = action.reason
            processedActions.push({
              type: 'death',
              characterName: characters.value[action.characterId].name,
              reason: action.reason
            })
            console.log(`Character ${characters.value[action.characterId].name} has died: ${action.reason}`)
          } else if (action.characterName) {
            // Handle case where AI refers to character by name but not ID
            const foundCharacter = Object.values(characters.value).find(char => 
              char.name.toLowerCase().includes(action.characterName.toLowerCase()) ||
              action.characterName.toLowerCase().includes(char.name.toLowerCase())
            )
            if (foundCharacter) {
              foundCharacter.status = 'dead'
              foundCharacter.deathReason = action.reason
              processedActions.push({
                type: 'death',
                characterName: foundCharacter.name,
                reason: action.reason
              })
              console.log(`Character ${foundCharacter.name} has died: ${action.reason}`)
            } else {
              console.warn(`AI tried to kill unknown character: ${action.characterName}`)
            }
          }
          break

        case 'create':
          const newCharacterId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newCharacter = {
            id: newCharacterId,
            name: action.characterName || 'Unknown',
            image: action.characterImage || '/images/characters/farmer.svg',
            role: action.characterRole || 'Citizen',
            affinity: 50,
            status: 'alive',
            encountered: true,
            interactions: [],
            isAIGenerated: true,
            creationReason: action.reason
          }
          
          characters.value[newCharacterId] = newCharacter
          aiGeneratedCharacters.value.push(newCharacter)
          
          processedActions.push({
            type: 'create',
            characterName: newCharacter.name,
            characterRole: newCharacter.role,
            reason: action.reason
          })
          console.log(`New character created: ${newCharacter.name} (${newCharacter.role}) - ${action.reason}`)
          break

        case 'modify':
          if (action.characterId && characters.value[action.characterId]) {
            const character = characters.value[action.characterId]
            // Modify character properties based on the action
            if (action.newRole) character.role = action.newRole
            if (action.affinityChange) {
              character.affinity = Math.max(0, Math.min(100, character.affinity + action.affinityChange))
            }
            character.interactions.push({
              turn: currentTurn.value,
              action: 'AI Modification',
              change: action.reason,
              timestamp: Date.now()
            })
            
            processedActions.push({
              type: 'modify',
              characterName: character.name,
              reason: action.reason
            })
            console.log(`Character ${character.name} modified: ${action.reason}`)
          } else {
            console.warn(`AI tried to modify unknown character: ${action.characterId}`)
          }
          break

        case 'exile':
          if (action.characterId && characters.value[action.characterId]) {
            characters.value[action.characterId].status = 'exiled'
            characters.value[action.characterId].exileReason = action.reason
            processedActions.push({
              type: 'exile',
              characterName: characters.value[action.characterId].name,
              reason: action.reason
            })
            console.log(`Character ${characters.value[action.characterId].name} exiled: ${action.reason}`)
          } else {
            console.warn(`AI tried to exile unknown character: ${action.characterId}`)
          }
          break
      }
    })

    return processedActions
  }

  const executeImmediateCharacterActions = (npc) => {
    if (npc.characterActions) {
      return processCharacterActions(npc.characterActions, -1)
    }
    return []
  }

  const executeChoiceCharacterActions = (npc, choiceIndex) => {
    if (npc.characterActions) {
      return processCharacterActions(npc.characterActions, choiceIndex)
    }
    return []
  }

  return {
    popularity,
    currentTurn,
    actionHistory,
    characters,
    addAction,
    resetGame,
    getCurrentNPC,
    processChoice,
    getGameState,
    canContinue,
    updateCharacterAffinity,
    addAIGeneratedCharacter,
    getAllCharacters,
    getCharacterById,
    processCharacterActions,
    executeImmediateCharacterActions,
    executeChoiceCharacterActions
  }
}
