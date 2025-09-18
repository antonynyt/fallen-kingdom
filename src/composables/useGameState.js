import { ref, computed } from 'vue'
import { gameData } from '../data/gameData.js'

export function useGameState() {
  const popularity = ref(50) // Start at 30%
  const currentTurn = ref(1)
  const actionHistory = ref([])
  const completedNPCs = ref([])
  const characters = ref({}) // Track character affinities and status
  const aiGeneratedCharacters = ref([]) // Store AI-generated characters
  
  // New story tracking properties
  const storyThemes = ref({
    justice: 0,      // harsh vs merciful choices
    diplomacy: 0,    // diplomatic vs aggressive
    tradition: 0,    // traditional vs progressive
    economy: 0,      // economic focus
    military: 0      // military/security focus
  })
  
  const storyArcs = ref([])
  const activeConflicts = ref([])
  const worldEvents = ref([])

  const addAction = (action) => {
    actionHistory.value.push({
      ...action,
      timestamp: Date.now(),
      popularity: popularity.value
    })
    
    // Update popularity
    popularity.value = Math.max(0, Math.min(100, popularity.value + action.popularityChange))
    
    // Update story themes based on choice
    updateStoryThemes(action)
    
    // Update character affinity and relationships
    updateCharacterAffinity(action)
    updateCharacterRelationships(action)
    
    // Process story consequences
    processStoryConsequences(action)
    
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
    storyThemes.value = {
      justice: 0,
      diplomacy: 0,
      tradition: 0,
      economy: 0,
      military: 0
    }
    storyArcs.value = []
    activeConflicts.value = []
    worldEvents.value = []
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
    // Enhanced NPC selection based on story flow
    let bestNPC = null
    let bestScore = -1
    
    availableNPCs.forEach(npc => {
      let score = 0
      
      // Base preference for turn
      if (npc.preferredTurn === turn) score += 20
      
      // Story relevance scoring
      score += calculateStoryRelevance(npc)
      
      // Character relationship scoring
      score += calculateRelationshipRelevance(npc)
      
      // Story arc progression scoring
      score += calculateStoryArcRelevance(npc)
      
      // Avoid repetitive character types
      score += calculateVarietyBonus(npc)
      
      if (score > bestScore) {
        bestScore = score
        bestNPC = npc
      }
    })
    
    return bestNPC || availableNPCs[0]
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
    popularity.value > 0 && currentTurn.value <= 5
  )

  const updateStoryThemes = (action) => {
    const choice = action.choice
    const intensity = Math.abs(action.popularityChange) / 10 // Scale theme impact
    
    switch (choice.type) {
      case 'harsh':
        storyThemes.value.justice -= intensity
        storyThemes.value.military += intensity * 0.5
        break
      case 'merciful':
        storyThemes.value.justice += intensity
        storyThemes.value.diplomacy += intensity * 0.3
        break
      case 'diplomatic':
        storyThemes.value.diplomacy += intensity
        break
      case 'threatening':
        storyThemes.value.military += intensity
        storyThemes.value.diplomacy -= intensity * 0.5
        break
      case 'generous':
        storyThemes.value.tradition += intensity * 0.5
        storyThemes.value.economy -= intensity * 0.3
        break
      case 'protective':
        storyThemes.value.military += intensity * 0.3
        storyThemes.value.diplomacy += intensity * 0.2
        break
    }
    
    // Add economic themes based on NPC role
    const npc = findNPCData(action.npc)
    if (npc?.role === 'merchant' || npc?.role === 'Burgher') {
      storyThemes.value.economy += intensity * 0.5
    }
    if (npc?.role === 'Clergy') {
      storyThemes.value.tradition += intensity * 0.4
    }
  }

  const updateCharacterRelationships = (action) => {
    const actedUponChar = characters.value[action.npc]
    if (!actedUponChar) return

    // Update relationships between characters based on action
    Object.values(characters.value).forEach(character => {
      if (character.id === action.npc) return
      
      // Check if characters have relationships
      const relationship = getCharacterRelationship(character.id, action.npc)
      if (relationship) {
        updateRelationshipBasedOnAction(character, actedUponChar, action, relationship)
      }
    })
  }

  const getCharacterRelationship = (char1Id, char2Id) => {
    const char1Data = findNPCData(char1Id)
    const char2Data = findNPCData(char2Id)
    
    return char1Data?.relationships?.find(rel => rel.characterId === char2Id) ||
           char2Data?.relationships?.find(rel => rel.characterId === char1Id)
  }

  const updateRelationshipBasedOnAction = (observer, target, action, relationship) => {
    let affinityChange = 0
    const relationshipType = relationship.type || 'ally'
    
    switch (relationshipType) {
      case 'family':
        // Family members react strongly to how their relatives are treated
        affinityChange = action.popularityChange * 2
        break
      case 'friend':
      case 'ally':
        affinityChange = action.popularityChange * 1.5
        break
      case 'rival':
        // Rivals are pleased when their enemies are treated poorly
        affinityChange = -action.popularityChange * 0.8
        break
      case 'enemy':
        affinityChange = -action.popularityChange * 1.2
        break
      case 'mentor':
      case 'student':
        affinityChange = action.popularityChange * 1.3
        break
      default:
        // General relationship - affected by modifier text
        affinityChange = action.popularityChange * 0.5
        break
    }
    
    observer.affinity = Math.max(0, Math.min(100, observer.affinity + affinityChange))
    
    if (Math.abs(affinityChange) > 5) {
      observer.interactions.push({
        turn: currentTurn.value,
        choice: `Reacted to treatment of ${target.name}`,
        affinityChange,
        relationshipContext: relationshipType,
        timestamp: Date.now()
      })
    }
  }

  const processStoryConsequences = (action) => {
    // Check for story arc triggers
    checkStoryArcTriggers(action)
    
    // Update active conflicts
    updateActiveConflicts(action)
    
    // Generate world events based on accumulated actions
    generateWorldEvents()
  }

  const checkStoryArcTriggers = (action) => {
    // Example: If player has been consistently harsh, trigger rebellion arc
    const harshActions = actionHistory.value.filter(a => a.choice.type === 'harsh' || a.choice.type === 'threatening').length
    
    if (harshActions >= 3 && !storyArcs.value.find(arc => arc.type === 'rebellion')) {
      storyArcs.value.push({
        type: 'rebellion',
        progress: 0,
        triggeredBy: action,
        description: 'Growing unrest among the people',
        characters: findDiscontentedCharacters()
      })
    }
    
    // Loyalty arc for diplomatic approach
    const diplomaticActions = actionHistory.value.filter(a => a.choice.type === 'diplomatic' || a.choice.type === 'merciful').length
    if (diplomaticActions >= 3 && !storyArcs.value.find(arc => arc.type === 'alliance')) {
      storyArcs.value.push({
        type: 'alliance',
        progress: 0,
        triggeredBy: action,
        description: 'Building strong alliances',
        characters: findLoyalCharacters()
      })
    }

    // Religious arc for generous/traditional choices
    const religiousActions = actionHistory.value.filter(a => a.choice.type === 'generous' && findNPCData(a.npc)?.role === 'Clergy').length
    if (religiousActions >= 2 && !storyArcs.value.find(arc => arc.type === 'divine_favor')) {
      storyArcs.value.push({
        type: 'divine_favor',
        progress: 0,
        triggeredBy: action,
        description: 'The gods smile upon your reign',
        characters: findReligiousCharacters()
      })
    }
  }

  const findDiscontentedCharacters = () => {
    return Object.values(characters.value)
      .filter(char => char.affinity < 30 && char.status === 'alive')
      .map(char => char.id)
  }

  const findLoyalCharacters = () => {
    return Object.values(characters.value)
      .filter(char => char.affinity > 70 && char.status === 'alive')
      .map(char => char.id)
  }

  const findReligiousCharacters = () => {
    return Object.values(characters.value)
      .filter(char => char.role === 'Clergy' && char.status === 'alive')
      .map(char => char.id)
  }

  const updateActiveConflicts = (action) => {
    // Remove resolved conflicts and update ongoing ones
    activeConflicts.value = activeConflicts.value.filter(conflict => {
      if (conflict.involvedCharacters.includes(action.npc)) {
        conflict.lastAction = action
        conflict.intensity += action.choice.type === 'harsh' ? 10 : -5
        return conflict.intensity > 0
      }
      return true
    })

    // Create new conflicts based on very negative interactions
    if (action.popularityChange <= -10) {
      const existingConflict = activeConflicts.value.find(c => c.involvedCharacters.includes(action.npc))
      if (!existingConflict) {
        activeConflicts.value.push({
          type: 'discontent',
          involvedCharacters: [action.npc],
          intensity: Math.abs(action.popularityChange),
          lastAction: action,
          description: `Growing tension with ${findNPCData(action.npc)?.name || 'unknown'}`
        })
      }
    }
  }

  const generateWorldEvents = () => {
    // Generate events based on story themes and character states
    const deadCharacters = Object.values(characters.value).filter(c => c.status === 'dead')
    const unhappyCharacters = Object.values(characters.value).filter(c => c.affinity < 30)
    
    if (deadCharacters.length >= 2 && Math.random() < 0.3) {
      const existingUnrest = worldEvents.value.find(e => e.type === 'unrest' && e.turn === currentTurn.value)
      if (!existingUnrest) {
        worldEvents.value.push({
          type: 'unrest',
          description: 'The people grow fearful of their king\'s harsh rule',
          turn: currentTurn.value,
          effects: { popularityModifier: -10 }
        })
      }
    }

    if (unhappyCharacters.length >= 4 && Math.random() < 0.25) {
      const existingDiscontent = worldEvents.value.find(e => e.type === 'discontent' && e.turn === currentTurn.value)
      if (!existingDiscontent) {
        worldEvents.value.push({
          type: 'discontent',
          description: 'Whispers of rebellion spread through the kingdom',
          turn: currentTurn.value,
          effects: { popularityModifier: -5 }
        })
      }
    }
  }

  const calculateStoryRelevance = (npc) => {
    let score = 0
    const themes = storyThemes.value
    
    // Match NPC to dominant story themes
    if (npc.role === 'Military' && Math.abs(themes.military) > 10) score += 15
    if (npc.role === 'Noble' && themes.diplomacy > 5) score += 10
    if (npc.role === 'Burgher' && themes.economy > 5) score += 12
    if (npc.role === 'Clergy' && themes.tradition > 5) score += 10
    if (npc.role === 'Peasant' && Math.abs(themes.justice) > 8) score += 12
    
    return score
  }

  const calculateRelationshipRelevance = (npc) => {
    let score = 0
    
    // Prioritize NPCs related to recently encountered characters
    const recentActions = actionHistory.value.slice(-3)
    recentActions.forEach(action => {
      if (npc.relationships?.some(rel => rel.affectedBy?.includes(action.npc))) {
        score += 8
      }
    })
    
    return score
  }

  const calculateStoryArcRelevance = (npc) => {
    let score = 0
    
    storyArcs.value.forEach(arc => {
      if (arc.characters.includes(npc.id)) score += 12
      
      // Boost characters that can advance story arcs
      if (arc.type === 'rebellion' && (npc.role === 'Military' || npc.role === 'Noble')) {
        score += 8
      }
      if (arc.type === 'alliance' && (npc.role === 'Noble' || npc.role === 'Burgher')) {
        score += 8
      }
      if (arc.type === 'divine_favor' && npc.role === 'Clergy') {
        score += 10
      }
    })
    
    return score
  }

  const calculateVarietyBonus = (npc) => {
    const recentRoles = actionHistory.value
      .slice(-3)
      .map(action => findNPCData(action.npc)?.role)
      .filter(Boolean)
    
    // Bonus for different roles to maintain variety
    return recentRoles.includes(npc.role) ? -5 : 5
  }

  const getStoryState = () => ({
    themes: storyThemes.value,
    arcs: storyArcs.value,
    conflicts: activeConflicts.value,
    events: worldEvents.value,
    dominantTheme: getDominantTheme()
  })

  const getDominantTheme = () => {
    const themes = storyThemes.value
    const dominant = Object.entries(themes)
      .reduce((max, [theme, value]) => 
        Math.abs(value) > Math.abs(max.value) ? { theme, value } : max,
        { theme: 'balanced', value: 0 }
      )
    return dominant.theme
  }

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
    storyThemes,
    storyArcs,
    activeConflicts,
    worldEvents,
    addAction,
    resetGame,
    getCurrentNPC,
    processChoice,
    getGameState,
    getStoryState,
    canContinue,
    updateCharacterAffinity,
    addAIGeneratedCharacter,
    getAllCharacters,
    getCharacterById,
    processCharacterActions,
    executeImmediateCharacterActions,
    executeChoiceCharacterActions,
    getDominantTheme
  }
}
