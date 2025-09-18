import { ref } from 'vue'

export function useAI() {
  const apiKey = ref('') // User will need to set this
  const isLoading = ref(false)
  const error = ref(null)

  // Initialize API key from localStorage if available
  const initializeApiKey = () => {
    const stored = localStorage.getItem('gemini_api_key')
    if (stored) {
      apiKey.value = stored
    }
  }

  // Call initialization immediately
  initializeApiKey()

  const setApiKey = (key) => {
    apiKey.value = key
    if (key) {
      localStorage.setItem('gemini_api_key', key)
    } else {
      localStorage.removeItem('gemini_api_key')
    }
  }

  const generateNPCContent = async (npcData, actionHistory, existingCharacters = {}) => {
    if (!apiKey.value) {
      // Using static content mode - this is expected behavior when no API key is set
      console.log('AI: Using static content (no API key configured)')
      return npcData
    }

    console.log('AI: Attempting to generate dynamic content for NPC:', npcData.name)
    isLoading.value = true
    error.value = null

    try {
      const context = buildContext(npcData, actionHistory, existingCharacters)
      const prompt = buildPrompt(npcData, context)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.value}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 1.0,  // Increased for more creativity and randomness
              topK: 40,          // Increased for more diverse word choices
              topP: 0.95,        // High value for more creative responses
              maxOutputTokens: 512,
              candidateCount: 1
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('AI: Raw response:', data)
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid AI response structure')
      }
      
      const generatedText = data.candidates[0].content.parts[0].text
      console.log('AI: Generated text:', generatedText)

      console.log('AI: Successfully generated content')
      // Parse the AI response and enhance the NPC
      const enhancedNPC = parseAIResponse(generatedText, npcData)
      return enhancedNPC

    } catch (err) {
      console.error('AI generation failed:', err)
      error.value = err.message
      return npcData // Fallback to default content
    } finally {
      isLoading.value = false
    }
  }

  const buildContext = (npcData, actionHistory, existingCharacters = {}) => {
    const relevantActions = actionHistory.filter(action => 
      isActionRelevantToNPC(action, npcData)
    )
    
    // Convert existing characters object to a simple summary for AI
    const characterSummary = Object.values(existingCharacters).map(char => ({
      name: char.name,
      role: char.role,
      status: char.status,
      affinity: char.affinity,
      deathReason: char.deathReason,
      exileReason: char.exileReason
    })).filter(char => char.status !== 'alive' || char.affinity < 30 || char.affinity > 70)
    
    return {
      pastActions: relevantActions,
      currentPopularity: actionHistory.length > 0 ? 
        actionHistory[actionHistory.length - 1].popularity : 50,
      npcRole: npcData.role,
      npcRelationships: npcData.relationships || [],
      existingCharacters: characterSummary
    }
  }

  const isActionRelevantToNPC = (action, npcData) => {
    // Check if past action affects this NPC
    if (npcData.relationships) {
      return npcData.relationships.some(rel => rel.affectedBy?.includes(action.npc))
    }
    return false
  }

  const buildPrompt = (npcData, context) => {
    // Add random elements to make each generation unique
    const randomEvents = [
      'a falling star struck nearby',
      'strange dreams plague the kingdom',
      'animals act strangely',
      'the dead seem restless',
      'magic flows wildly',
      'time feels different',
      'the seasons changed suddenly',
      'old curses awaken',
      'gods walk among us',
      'the world seems mad'
    ]
    
    const randomComplications = [
      'but a terrible price must be paid',
      'yet dark forces interfere',
      'while ancient prophecies unfold',
      'as reality tears apart',
      'though the gods demand sacrifice',
      'but the cure brings worse problems',
      'while time runs out',
      'as chaos spreads everywhere',
      'yet hope dies with each choice',
      'but madness creeps in'
    ]
    
    const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)]
    const randomComplication = randomComplications[Math.floor(Math.random() * randomComplications.length)]
    
    return `
You are a darkly humorous storyteller for a medieval kingdom game where the new king faces terrible choices.

Starting Point:
- Character: ${npcData.name} (${npcData.role})
- Their Problem: ${npcData.baseComplaint}
- Kingdom Popularity: ${context.currentPopularity}%
- Past Royal Decisions: ${JSON.stringify(context.pastActions)}
- Existing Characters & Fates: ${JSON.stringify(context.existingCharacters)}

IMPORTANT: Use past character actions to create consequences. If characters died or were exiled, their families or allies might appear!

RANDOM ELEMENT: ${randomEvent}
STORY TWIST: ${randomComplication}

MEDIEVAL SPEECH STYLE (Keep it Simple):
- Use "My Lord" or "Your Majesty" for addressing the king
- Add occasional "Please" → "Pray" or "Prithee"
- Use "Perhaps" → "Mayhap" sometimes
- Add "-eth" to some verbs (speaks → speaketh, but keep it rare)
- Use simple old words: "Aye" (yes), "Nay" (no), "'Tis" (it is)
- Keep sentences SHORT and CLEAR for non-native speakers

DARK HUMOR GUIDELINES:
🖤 MAKE IT DARKLY FUNNY: Situations should be tragic but absurd
💀 IRONIC TWISTS: Characters face grimly amusing fates
😈 GALLOWS HUMOR: Find comedy in desperate situations
🔥 CYNICAL TONE: All choices have terrible outcomes
⚡ TWISTED RESULTS: Even good deeds backfire

CREATIVE FREEDOM:
- Transform scenarios based on past events with dark twists
- Add unexpected tragic-comic moments
- Show how past decisions created darkly ironic situations
- Make moral choices where doing right brings suffering

FORMAT YOUR RESPONSE:
{
  "dialogue": "Character speaks their problem in simple medieval style (MAX 50 words) - ONLY their direct speech, no descriptions",
  "summary": "Brief summary of the situation and context (5 words max)",
  "choices": [
    {
      "text": "Simple action choice (10 words max)",
      "consequence": "Dark ironic result (5 words max)",
      "popularityChange": number (-20 to +20),
      "narratorResponse": "Grimly funny consequence in simple medieval style (20 words max)"
    }
  ],
  "characterActions": [
    {
      "type": "death|create|modify|exile",
      "characterId": "id_of_affected_character",
      "characterName": "name if creating new character",
      "characterRole": "role if creating new character", 
      "characterImage": "image_path if creating new character",
      "reason": "brief explanation why this happened",
      "triggerChoice": 0 // which choice triggers this, -1 for immediate
    }
  ]
}

CHARACTER ACTIONS:
- DEATH: Characters die from harsh choices, disease, accidents, revenge
- CREATE: New characters emerge from your choices (refugees, rebels, heroes)
- MODIFY: Existing characters change roles, status, or relationships
- EXILE: Characters get banished or flee the kingdom

EXAMPLE SIMPLE MEDIEVAL SPEECH:
- "My Lord, the children starve!" (not "Prithee, thy subjects doth perish")
- "Please help us, Your Majesty!" (not "We beseech thee, noble sovereign")
- "Mayhap 'tis better to die." (not "Perchance 'twould be meet to perish")
- "The gods mock us this day." (not "Verily, the divine ones doth jest")

KEEP IT SIMPLE BUT ATMOSPHERIC! Dark humor with easy-to-understand medieval flavor!
`
}

  const parseAIResponse = (aiText, originalNPC) => {
    try {
      console.log('AI: Parsing response:', aiText.substring(0, 200) + '...')
      
      // Clean the text first - remove any potential encoding issues and markdown
      let cleanText = aiText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      
      // Remove markdown code blocks if present - handle both opening and closing blocks
      cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      
      // If the response still starts with non-JSON content, try to find the JSON part
      if (!cleanText.startsWith('{')) {
        const jsonStart = cleanText.indexOf('{')
        if (jsonStart !== -1) {
          cleanText = cleanText.substring(jsonStart)
        }
      }
      
      // Try to extract JSON from the AI response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      
      // Fix invalid JSON with unary plus operators and attempt to fix incomplete JSON
      let jsonText = jsonMatch ? jsonMatch[0] : cleanText
      if (jsonText) {
        // Remove unary plus operators that make JSON invalid
        jsonText = jsonText.replace(/:\s*\+(\d+)/g, ': $1')
        
        // Attempt to fix incomplete JSON by adding missing closing brackets
        const openBraces = (jsonText.match(/\{/g) || []).length
        const closeBraces = (jsonText.match(/\}/g) || []).length
        const openBrackets = (jsonText.match(/\[/g) || []).length
        const closeBrackets = (jsonText.match(/\]/g) || []).length
        
        // Add missing closing brackets for arrays
        for (let i = closeBrackets; i < openBrackets; i++) {
          jsonText += ']'
        }
        
        // Add missing closing braces for objects
        for (let i = closeBraces; i < openBraces; i++) {
          jsonText += '}'
        }
        
        console.log('AI: Attempting to parse JSON:', jsonText.substring(0, 500) + '...')
      }
      
      if (jsonText) {
        const parsed = JSON.parse(jsonText)
        
        // Validate the parsed response
        if (!parsed.dialogue || !parsed.choices || !Array.isArray(parsed.choices)) {
          throw new Error('Invalid AI response format')
        }
        
        // Ensure choices have narrator responses
        const enhancedChoices = parsed.choices?.map(choice => ({
          ...choice,
          narratorResponse: choice.narratorResponse || generateFallbackNarrator(choice, originalNPC)
        })) || originalNPC.choices

        // Extract and validate character actions if present
        let characterActions = []
        if (parsed.characterActions && Array.isArray(parsed.characterActions)) {
          characterActions = parsed.characterActions.filter(action => 
            action.type && ['death', 'create', 'modify', 'exile'].includes(action.type)
          )
        }
        
        const result = {
          ...originalNPC,
          dialogue: parsed.dialogue || originalNPC.dialogue,
          choices: enhancedChoices,
          characterActions: characterActions
        }
        
        console.log('AI: Successfully parsed response with character actions:', result)
        return result
      } else {
        console.warn('AI: No JSON found in response')
      }
    } catch (e) {
      console.warn('AI: Failed to parse response:', e.message)
      console.warn('AI: Raw text was:', aiText)
    }
    
    console.log('AI: Using fallback content')
    return originalNPC
  }

  const generateFallbackNarrator = (choice, npc) => {
    // Generate a simple narrator response based on choice consequence
    const consequences = choice.consequence?.toLowerCase() || ''
    if (consequences.includes('approve') || consequences.includes('cheer')) {
      return `The ${npc.role.toLowerCase()} leaves satisfied with your decision.`
    } else if (consequences.includes('disappoint') || consequences.includes('angry')) {
      return `You sense growing discontent among the people.`
    } else {
      return `Your choice ripples through the kingdom's halls.`
    }
  }

  return {
    generateNPCContent,
    setApiKey,
    hasApiKey: () => !!apiKey.value,
    isLoading,
    error
  }
}
