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

  const generateNPCContent = async (npcData, actionHistory) => {
    if (!apiKey.value) {
      // Using static content mode - this is expected behavior when no API key is set
      console.log('AI: Using static content (no API key configured)')
      return npcData
    }

    console.log('AI: Attempting to generate dynamic content for NPC:', npcData.name)
    isLoading.value = true
    error.value = null

    try {
      const context = buildContext(npcData, actionHistory)
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
              temperature: 0.7,  // Reduced for more consistent responses
              topK: 40,          // Reduced for more focused responses
              topP: 0.8,         // Reduced for more consistent responses
              maxOutputTokens: 512,  // Reduced since we want short responses
              candidateCount: 1   // Ensure single response
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

  const buildContext = (npcData, actionHistory) => {
    const relevantActions = actionHistory.filter(action => 
      isActionRelevantToNPC(action, npcData)
    )

    return {
      pastActions: relevantActions,
      currentPopularity: actionHistory.length > 0 ? 
        actionHistory[actionHistory.length - 1].popularity : 50,
      npcRole: npcData.role,
      npcRelationships: npcData.relationships || []
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
    return `
You are generating content for a medieval fantasy game where a new king must handle complaints from his subjects.

NPC Information:
- Name: ${npcData.name}
- Role: ${npcData.role}
- Base Complaint: ${npcData.baseComplaint}

Game Context:
- Current King's Popularity: ${context.currentPopularity}%
- Relevant Past Actions: ${JSON.stringify(context.pastActions)}

STRICT REQUIREMENTS:
USE SIMPLE LANGUAGE
1. Generate a dialogue that reflects the NPC's personality and their complaint.
2. Consider how past royal decisions might have affected this character
3. Choice text: MAXIMUM 10 words each - short and clear
4. Create 3 distinct choice options for the king, each with different consequences
5. Each choice should have a popularity impact (-15 to +15)
6. Keep the tone medieval but accessible

Format your response as JSON:
{
  "dialogue": "Character's complaint in 50 words or less",
  "choices": [
    {
      "text": "Choice text (15 words max)",
      "consequence": "Brief description of what happens without spoilers (10 words max)",
      "popularityChange": number,
      "narratorResponse": "Narrator description of what happened (15 words max), dark humor, the user should feel guilty."
    }
  ]
}

Count words carefully. Medieval tone but easy to understand.
`
  }

  const parseAIResponse = (aiText, originalNPC) => {
    try {
      console.log('AI: Parsing response:', aiText.substring(0, 200) + '...')
      
      // Clean the text first - remove any potential encoding issues
      const cleanText = aiText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      
      // Try to extract JSON from the AI response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log('AI: Found JSON:', jsonMatch[0])
        const parsed = JSON.parse(jsonMatch[0])
        
        // Validate the parsed response
        if (!parsed.dialogue || !parsed.choices || !Array.isArray(parsed.choices)) {
          throw new Error('Invalid AI response format')
        }
        
        // Ensure choices have narrator responses
        const enhancedChoices = parsed.choices?.map(choice => ({
          ...choice,
          narratorResponse: choice.narratorResponse || generateFallbackNarrator(choice, originalNPC)
        })) || originalNPC.choices
        
        const result = {
          ...originalNPC,
          dialogue: parsed.dialogue || originalNPC.dialogue,
          choices: enhancedChoices
        }
        
        console.log('AI: Successfully parsed response:', result)
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
