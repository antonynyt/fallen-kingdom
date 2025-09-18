<template>
  <div class="narrator-overlay">
    <!-- Consequence-based screen effects -->
    <div 
      v-if="consequenceData.type === 'death'" 
      class="screen-effect death-effect"
    ></div>
    <div 
      v-if="consequenceData.type === 'rebellion'" 
      class="screen-effect rebellion-effect"
    ></div>
    <div 
      v-if="consequenceData.type === 'positive'" 
      class="screen-effect positive-effect"
    ></div>

    <!-- Popularity change visual indicator -->
    <div class="popularity-change-indicator" :class="popularityChangeClass">
      <div class="popularity-change-text">
        {{ formatPopularityChange(consequenceData.popularityChange) }}
      </div>
      <div class="popularity-arrows">
        <span v-for="n in Math.abs(consequenceData.popularityChange)" :key="n" class="arrow">
          {{ consequenceData.popularityChange > 0 ? '↑' : '↓' }}
        </span>
      </div>
    </div>

    <div class="narrator-content" :class="narratorContentClass">
      <!-- Impact severity indicator -->
      <div class="impact-indicator" :class="impactSeverityClass">
        <div class="impact-label">{{ impactLabel }}</div>
        <div class="impact-meter">
          <div class="impact-fill" :style="{ width: impactFillWidth }"></div>
        </div>
      </div>

      <h3 class="narrator-title" :class="narratorTitleClass">
        {{ narratorTitle }}
      </h3>
      
      <!-- Character actions visual display -->
      <div v-if="characterActions.length > 0" class="character-actions">
        <div 
          v-for="action in characterActions" 
          :key="action.characterId || action.characterName"
          class="character-action"
          :class="action.type"
        >
          <div class="action-icon">
            {{ getActionIcon(action.type) }}
          </div>
          <div class="action-details">
            <div class="character-name">{{ action.characterName }}</div>
            <div class="action-description">{{ action.reason }}</div>
          </div>
        </div>
      </div>

      <p class="narrator-text" :class="narratorTextClass">
        {{ narratorText }}
      </p>

      <!-- Kingdom status changes -->
      <div v-if="hasSignificantChanges" class="kingdom-status">
        <h4>Kingdom Changes:</h4>
        <div class="status-grid">
          <div v-if="storyThemeChanges.length > 0" class="theme-changes">
            <div 
              v-for="change in storyThemeChanges" 
              :key="change.theme"
              class="theme-change"
              :class="change.direction"
            >
              {{ change.theme }}: {{ change.direction === 'increase' ? '+' : '-' }}{{ Math.abs(change.amount) }}
            </div>
          </div>
          
          <div v-if="newStoryArcs.length > 0" class="new-arcs">
            <div v-for="arc in newStoryArcs" :key="arc.type" class="new-arc">
              New Story: {{ arc.description }}
            </div>
          </div>
        </div>
      </div>

      <div class="narrator-actions">
        <button 
          @click="$emit('continue')" 
          class="continue-button" 
          :class="[continueButtonClass, { 'button-disabled': isButtonDisabled }]"
          :disabled="isButtonDisabled"
        >
          {{ isButtonDisabled ? 'Absorbing Consequences...' : continueButtonText }}
        </button>
        <div class="countdown-timer" :class="countdownClass">
          {{ isButtonDisabled ? `Button enabled in ${buttonEnabledIn}s` : 'Click to continue when ready' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  consequenceData: {
    type: Object,
    required: true,
    default: () => ({
      type: 'neutral',
      popularityChange: 0,
      severity: 'low'
    })
  },
  characterActions: {
    type: Array,
    default: () => []
  },
  narratorText: {
    type: String,
    required: true
  },
  storyThemeChanges: {
    type: Array,
    default: () => []
  },
  newStoryArcs: {
    type: Array,
    default: () => []
  },
  countdown: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['continue'])

// Button disabled logic - disabled for first 5 seconds
const isButtonDisabled = computed(() => {
  // Calculate initial countdown based on severity
  const baseTime = props.consequenceData.severity === 'extreme' ? 15 : 
                   props.consequenceData.severity === 'high' ? 12 : 10
  return props.countdown > (baseTime - 5)
})

const buttonEnabledIn = computed(() => {
  const baseTime = props.consequenceData.severity === 'extreme' ? 15 : 
                   props.consequenceData.severity === 'high' ? 12 : 10
  return Math.max(0, props.countdown - (baseTime - 5))
})

// Enhanced computed properties for narrator styling
const popularityChangeClass = computed(() => {
  const change = props.consequenceData.popularityChange
  if (change > 10) return 'popularity-major-positive'
  if (change > 5) return 'popularity-positive'
  if (change < -10) return 'popularity-major-negative'
  if (change < -5) return 'popularity-negative'
  return 'popularity-neutral'
})

const narratorContentClass = computed(() => {
  const type = props.consequenceData.type
  return `narrator-${type}`
})

const narratorTitleClass = computed(() => {
  const severity = props.consequenceData.severity
  return `title-${severity}`
})

const narratorTextClass = computed(() => {
  const type = props.consequenceData.type
  return `text-${type}`
})

const continueButtonClass = computed(() => {
  const type = props.consequenceData.type
  if (type === 'death') return 'button-death'
  if (type === 'rebellion') return 'button-rebellion'
  if (type === 'positive') return 'button-positive'
  return 'button-neutral'
})

const continueButtonText = computed(() => {
  const type = props.consequenceData.type
  if (type === 'death') return 'Face the Consequences'
  if (type === 'rebellion') return 'Steel Yourself'
  if (type === 'positive') return 'Enjoy the Moment'
  return 'Continue Ruling'
})

const countdownClass = computed(() => {
  if (isButtonDisabled.value) {
    return 'countdown-disabled'
  }
  return 'countdown-ready'
})

const narratorTitle = computed(() => {
  const type = props.consequenceData.type
  const severity = props.consequenceData.severity
  
  if (type === 'death') return '💀 TRAGIC CONSEQUENCES'
  if (type === 'rebellion') return '⚔️ UPRISING BREWING'
  if (type === 'positive' && severity === 'high') return '👑 GLORIOUS DECISION'
  if (type === 'positive') return '✨ WISE CHOICE'
  if (severity === 'high') return '🔥 DRAMATIC TURN'
  return 'The Kingdom Reacts'
})

const impactSeverityClass = computed(() => {
  return `impact-${props.consequenceData.severity}`
})

const impactLabel = computed(() => {
  const severity = props.consequenceData.severity
  switch (severity) {
    case 'extreme': return 'KINGDOM SHAKING'
    case 'high': return 'MAJOR IMPACT'
    case 'medium': return 'NOTICEABLE CHANGE'
    default: return 'MINOR RIPPLE'
  }
})

const impactFillWidth = computed(() => {
  const severity = props.consequenceData.severity
  switch (severity) {
    case 'extreme': return '100%'
    case 'high': return '75%'
    case 'medium': return '50%'
    default: return '25%'
  }
})

const hasSignificantChanges = computed(() => {
  return props.storyThemeChanges.length > 0 || props.newStoryArcs.length > 0
})

const getActionIcon = (actionType) => {
  switch (actionType) {
    case 'death': return '💀'
    case 'create': return '👤'
    case 'exile': return '🚪'
    case 'modify': return '🔄'
    default: return '⚡'
  }
}

const formatPopularityChange = (change) => {
  if (change > 0) return `+${change} Popularity`
  if (change < 0) return `${change} Popularity`
  return 'No Change'
}
</script>

<style scoped>
/* Enhanced Screen Effects */
.narrator-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.screen-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.death-effect {
  background: radial-gradient(circle, transparent 0%, rgba(139, 0, 0, 0.3) 100%);
  animation: deathPulse 2s ease-in-out infinite;
}

.rebellion-effect {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 50px,
    rgba(255, 0, 0, 0.1) 50px,
    rgba(255, 0, 0, 0.1) 100px
  );
  animation: rebellionShake 0.5s ease-in-out infinite;
}

.positive-effect {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: positiveGlow 3s ease-in-out;
}

@keyframes deathPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes rebellionShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes positiveGlow {
  0% { opacity: 0; }
  50% { opacity: 0.4; }
  100% { opacity: 0; }
}

/* Popularity Change Indicator */
.popularity-change-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  z-index: 10;
  animation: popIn 0.5s ease-out;
}

.popularity-major-positive {
  background: rgba(0, 255, 0, 0.9);
  color: #000;
  border: 3px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

.popularity-positive {
  background: rgba(0, 200, 0, 0.8);
  color: #fff;
  border: 2px solid #00c800;
}

.popularity-major-negative {
  background: rgba(255, 0, 0, 0.9);
  color: #fff;
  border: 3px solid #ff0000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.popularity-negative {
  background: rgba(200, 0, 0, 0.8);
  color: #fff;
  border: 2px solid #c80000;
}

.popularity-neutral {
  background: rgba(128, 128, 128, 0.8);
  color: #fff;
  border: 2px solid #808080;
}

.popularity-arrows {
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.arrow {
  margin: 0 2px;
}

@keyframes popIn {
  0% { transform: scale(0) rotate(180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.narrator-content {
  background: rgba(20, 20, 30, 0.95);
  padding: 3rem;
  border-radius: 15px;
  border: 2px solid #ffd700;
  max-width: 700px;
  text-align: center;
  position: relative;
  animation: narratorEnter 0.5s ease-out;
}

/* Content variations based on consequence type */
.narrator-death {
  border-color: #8b0000;
  background: rgba(30, 10, 10, 0.95);
}

.narrator-rebellion {
  border-color: #ff4500;
  background: rgba(30, 15, 10, 0.95);
  animation: narratorShake 0.3s ease-in-out 3;
}

.narrator-positive {
  border-color: #ffd700;
  background: rgba(25, 25, 15, 0.95);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

@keyframes narratorEnter {
  0% { transform: scale(0.8) translateY(50px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes narratorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Impact Indicator */
.impact-indicator {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
}

.impact-low {
  background: rgba(128, 128, 128, 0.2);
  border: 1px solid #808080;
}

.impact-medium {
  background: rgba(255, 165, 0, 0.2);
  border: 1px solid #ffa500;
}

.impact-high {
  background: rgba(255, 69, 0, 0.2);
  border: 1px solid #ff4500;
}

.impact-extreme {
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid #8b0000;
  animation: impactPulse 1s ease-in-out infinite;
}

@keyframes impactPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(139, 0, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 0, 0, 0.8); }
}

.impact-label {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.impact-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff4500, #8b0000);
  transition: width 0.5s ease-out;
}

.narrator-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.title-low { color: #e0e0e0; }
.title-medium { color: #ffa500; }
.title-high { color: #ff4500; }
.title-extreme { 
  color: #ff0000;
  animation: titleFlicker 0.5s ease-in-out infinite;
}

@keyframes titleFlicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Character Actions Display */
.character-actions {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #ffd700;
}

.character-action {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 6px;
  animation: actionSlideIn 0.5s ease-out;
}

.character-action.death {
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid #8b0000;
}

.character-action.create {
  background: rgba(0, 128, 0, 0.2);
  border: 1px solid #008000;
}

.character-action.exile {
  background: rgba(255, 140, 0, 0.2);
  border: 1px solid #ff8c00;
}

.character-action.modify {
  background: rgba(70, 130, 180, 0.2);
  border: 1px solid #4682b4;
}

@keyframes actionSlideIn {
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.action-icon {
  font-size: 2rem;
  margin-right: 1rem;
  min-width: 3rem;
}

.action-details {
  text-align: left;
  flex: 1;
}

.character-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #ffd700;
}

.action-description {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 0.2rem;
}

/* Kingdom Status Changes */
.kingdom-status {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(25, 25, 50, 0.4);
  border-radius: 8px;
  border: 1px solid #4169e1;
}

.kingdom-status h4 {
  color: #87ceeb;
  margin-bottom: 1rem;
  text-align: center;
}

.status-grid {
  display: grid;
  gap: 1rem;
}

.theme-change {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.theme-change.increase {
  background: rgba(0, 255, 0, 0.1);
  color: #90ee90;
}

.theme-change.decrease {
  background: rgba(255, 0, 0, 0.1);
  color: #ffa07a;
}

.new-arc {
  padding: 0.5rem;
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  border-radius: 4px;
  font-size: 0.9rem;
  animation: arcGlow 2s ease-in-out infinite;
}

@keyframes arcGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
}

.narrator-text {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-style: italic;
}

.text-death { color: #ffb6c1; }
.text-rebellion { color: #ffa500; }
.text-positive { color: #98fb98; }
.text-neutral { color: #e0e0e0; }

.narrator-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.continue-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(128, 128, 128, 0.5) !important;
  color: #999 !important;
  border: 2px solid #666 !important;
  box-shadow: none !important;
  animation: disabledPulse 2s ease-in-out infinite;
}

.button-disabled:hover {
  background: rgba(128, 128, 128, 0.5) !important;
  box-shadow: none !important;
  transform: none !important;
}

@keyframes disabledPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.4; }
}

.button-death {
  background: rgba(139, 0, 0, 0.9);
  color: #fff;
  border: 2px solid #8b0000;
}

.button-death:hover {
  background: rgba(178, 34, 34, 0.9);
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
}

.button-rebellion {
  background: rgba(255, 69, 0, 0.9);
  color: #fff;
  border: 2px solid #ff4500;
}

.button-rebellion:hover {
  background: rgba(255, 99, 71, 0.9);
  box-shadow: 0 0 15px rgba(255, 69, 0, 0.5);
}

.button-positive {
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  border: 2px solid #ffd700;
}

.button-positive:hover {
  background: rgba(255, 255, 0, 0.9);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.button-neutral {
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  border: 2px solid #ffd700;
}

.countdown-timer {
  font-size: 0.9rem;
  font-style: italic;
}

.countdown-disabled { 
  color: #ffa500;
  animation: countdownBlink 1s ease-in-out infinite;
}
.countdown-ready { 
  color: #87ceeb;
}

@keyframes countdownBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
