# The King's Trial - A Royal Decision Game

A Vue.js 3 game where you play as a newly crowned king who must handle complaints from subjects while maintaining popularity to avoid rebellion.

## 🎮 Game Overview

- **Theme**: Medieval fantasy kingdom management
- **Duration**: 5-10 minutes (15 turns)
- **Mechanics**: Choice-based narrative with consequences
- **Goal**: Maintain popularity above 0% to avoid rebellion
- **AI Integration**: Dynamic NPC responses using Google Gemini AI (optional)

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Generate placeholder images** (optional):
   Open `image-generator.html` in your browser and click "Generate All Images" to create placeholder images for the game.

4. **Configure AI** (optional):
   When you first run the game, you'll be prompted to enter a Google Gemini API key for dynamic content generation. You can skip this step to play with static content.

## 🎯 Game Features

### Core Mechanics
- **Popularity System**: Starts at 50%, affected by decisions
- **Memory System**: Past actions influence future NPCs
- **15 Unique NPCs**: Each with distinct roles and interconnected storylines
- **Multiple Endings**: Based on final popularity score

### NPCs & Roles
1. **John the Farmer** - Peasant struggling with taxes
2. **Elena the Merchant** - Burgher worried about bandit attacks
3. **Lord Blackwood** - Noble questioning your leadership
4. **Father Marcus** - Priest seeking church support
5. **Captain Steel** - Military officer requesting resources
6. **Morgana the Wise** - Mystic warning about persecution
7. **Little Tim** - Orphan child needing help
8. **Ambassador Valdris** - Diplomat with foreign concerns
9. **Anne the Healer** - Physician dealing with plague
10. **Garon the Smith** - Craftsman facing competition
11. **Scholar Livia** - Academic promoting education
12. **The Crow** - Spymaster revealing conspiracies
13. **Felix the Bard** - Entertainer sensing low morale
14. **Ghost of Old King** - Supernatural test of worthiness
15. **Draconic Envoy** - Mythical being enforcing ancient treaties

### UI Design
- **Full-screen backgrounds** for immersive experience
- **Life is Strange inspired** dialogue system
- **Bottom-positioned dialogue bubbles** with character portraits
- **Cinematic transitions** between scenes
- **Medieval typography** (Cinzel & Crimson Text fonts)

## 🤖 AI Integration

### Gemini API Features
- **Dynamic Dialogue**: NPCs react to your past decisions
- **Contextual Responses**: Characters remember your choices
- **Adaptive Consequences**: Outcomes change based on history

### Setup Instructions
1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. When prompted in-game, enter your API key
3. The key is stored locally in your browser

### Fallback System
If no API key is provided, the game uses well-crafted static dialogue that still provides an engaging experience.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ApiKeyConfig.vue      # AI configuration
│   ├── ChoiceButton.vue      # Interactive choice buttons
│   ├── DialogueBubble.vue    # Character dialogue display
│   ├── EndScreen.vue         # Game ending screen
│   ├── GameButton.vue        # Reusable button component
│   ├── GameScreen.vue        # Main gameplay interface
│   ├── IntroScreen.vue       # Game introduction
│   └── KingComplaintsGame.vue # Main game controller
├── composables/
│   ├── useAI.js             # Gemini AI integration
│   └── useGameState.js      # Game state management
├── data/
│   └── gameData.js          # NPC definitions and storylines
└── utils/
    └── placeholderGenerator.js # Image generation utilities
```

## 🎨 Visual Assets

The game uses placeholder images that can be generated using the included `image-generator.html` file. These create atmospheric colored backgrounds with text labels.

### Required Images
- **Character Portraits**: 200x200px for dialogue bubbles
- **Background Scenes**: 1920x1080px for full-screen ambiance

## 🔧 Development

### Vue 3 Composition API
The project uses Vue 3's Composition API for:
- Reactive state management
- Composable utilities
- Component composition

### Key Composables
- **useGameState**: Manages popularity, turns, and action history
- **useAI**: Handles Gemini API integration and content generation

### Styling Approach
- **Scoped CSS** for component isolation
- **CSS Custom Properties** for theming
- **Responsive design** for different screen sizes

## 🎯 Game Balance

### Popularity System
- **Starting value**: 50%
- **Choice impact**: -20 to +15 points per decision
- **Rebellion threshold**: 0% popularity
- **Victory threshold**: Complete 15 turns with >0% popularity

### Choice Types
- **Merciful**: Usually increases popularity
- **Harsh**: Usually decreases popularity but may have strategic value
- **Diplomatic**: Balanced approach with moderate consequences

## 📦 Build & Deploy

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Preview production build**:
   ```bash
   npm run preview
   ```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.

## 🎮 Game Tips

1. **Read carefully**: Each choice has described consequences
2. **Consider relationships**: NPCs may reference past decisions
3. **Balance interests**: Different groups have conflicting needs
4. **Watch popularity**: Keep it above 0% to avoid game over
5. **Plan ahead**: Early choices affect later encounters

## 🚀 Future Enhancements

- **Sound effects** and ambient music
- **Animated transitions** between scenes
- **Achievement system** for different play styles
- **Multiple save slots** for different playthroughs
- **Extended storylines** with more NPCs

---

**Enjoy your reign, Your Majesty!** 👑
