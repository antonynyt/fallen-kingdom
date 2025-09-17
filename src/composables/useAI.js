import { ref } from 'vue'

export function useAI() {
  const apiKey = ref('') // User will need to set this
  const isLoading = ref(false)
  const error = ref(null)

  const setApiKey = (key) => {
    apiKey.value = key
  }

  const generateNPCContent = async (npcData, actionHistory) => {
    if (!apiKey.value) {
      console.warn('Gemini API key not set, using default content')
      return npcData
    }

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
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text

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

Instructions:
1. Generate a dialogue that reflects the NPC's personality and their complaint
2. Consider how past royal decisions might have affected this character
3. Create 3 distinct choice options for the king, each with different consequences
4. Each choice should have a popularity impact (-15 to +15)
5. Keep the tone medieval but accessible

Format your response as JSON:
{
  "dialogue": "The character's main complaint/request speech",
  "choices": [
    {
      "text": "Choice text",
      "consequence": "Brief description of what happens",
      "popularityChange": number
    }
  ]
}

Make the dialogue engaging and the choices meaningful with clear trade-offs.
`
  }

  const parseAIResponse = (aiText, originalNPC) => {
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          ...originalNPC,
          dialogue: parsed.dialogue || originalNPC.dialogue,
          choices: parsed.choices || originalNPC.choices
        }
      }
    } catch (e) {
      console.warn('Failed to parse AI response, using defaults')
    }
    
    return originalNPC
  }

  return {
    generateNPCContent,
    setApiKey,
    isLoading,
    error
  }
}
