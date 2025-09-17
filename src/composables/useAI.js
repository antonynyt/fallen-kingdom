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
    // Add random elements to make each generation unique
    const randomEvents = [
      'a meteor has fallen nearby',
      'strange dreams plague the kingdom',
      'animals speak prophecies',
      'the dead have been restless',
      'magic flows chaotically',
      'time moves strangely',
      'the seasons have reversed',
      'ancient curses awaken',
      'gods walk among mortals',
      'reality itself seems unstable'
    ]
    
    const randomComplications = [
      'but a terrible price must be paid',
      'yet dark forces manipulate events',
      'while ancient prophecies unfold',
      'as reality tears at the seams',
      'though the gods demand sacrifice',
      'but the cure is worse than the disease',
      'while time runs out',
      'as chaos spreads unchecked',
      'yet hope dies with each choice',
      'but madness seeps into reason'
    ]
    
    const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)]
    const randomComplication = randomComplications[Math.floor(Math.random() * randomComplications.length)]
    
    return `
You are a darkly humorous storyteller generating content for a medieval fantasy kingdom simulation. 
The new king faces morally complex dilemmas where every choice has terrible consequences.

Starting Point:
- Character: ${npcData.name} (${npcData.role})
- Base Issue: ${npcData.baseComplaint}
- Kingdom Popularity: ${context.currentPopularity}%
- Past Royal Decisions: ${JSON.stringify(context.pastActions)}

RANDOM ELEMENT TO INCORPORATE: ${randomEvent}
STORY COMPLICATION: ${randomComplication}

DARK HUMOR GUIDELINES:
🖤 EMBRACE DARK COMEDY: Make situations absurdly tragic or ironically twisted
💀 MORBID IRONY: Characters should face grimly humorous predicaments
� GALLOWS HUMOR: Find comedy in desperate situations
🔥 CYNICAL TONE: Present choices where all outcomes are somewhat terrible
� CHAOTIC CONSEQUENCES: Even "good" choices should have dark undertones

CREATIVE FREEDOM:
- Transform scenarios based on past events with dark twists
- Add unexpected tragic-comic elements
- Show how past decisions created darkly ironic situations
- Make moral choices where righteousness leads to suffering

FORMAT:
{
  "dialogue": "Character's darkly humorous situation (MAX 50 words) - be grimly entertaining, dialogue only no narration nor name of the speaker nor special characters",
  "choices": [
    {
      "text": "Action choice (10 words max)",
      "consequence": "Darkly ironic outcome (5 words max)",
      "popularityChange": number (-20 to +20) based on how absurdly good or bad the choice is,
      "narratorResponse": "Grimly humorous consequence (20 words max)"
    }
  ]
}

MAKE IT DARKLY FUNNY! Every situation should be tragically absurd! use simple language for non native speakers.
`
  }

  const parseAIResponse = (aiText, originalNPC) => {
    try {
      console.log('AI: Parsing response:', aiText.substring(0, 200) + '...')
      
      // Clean the text first - remove any potential encoding issues
      const cleanText = aiText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      
      // Try to extract JSON from the AI response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      
      // Fix invalid JSON with unary plus operators
      let jsonText = jsonMatch ? jsonMatch[0] : null
      if (jsonText) {
        // Remove unary plus operators that make JSON invalid
        jsonText = jsonText.replace(/:\s*\+(\d+)/g, ': $1')
      }
      if (jsonText) {
        console.log('AI: Found JSON:', jsonText)
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
