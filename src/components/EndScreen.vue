<template>
  <div class="end-screen">
    <div class="end-overlay">
      <div class="end-content">
        <h1 class="end-title">{{ endTitle }}</h1>
        <div class="end-text">
          <p>{{ endDescription }}</p>
          <p class="final-popularity">Final Popularity: {{ popularity }}%</p>
          
          <!-- Reign Summary -->
          <div class="reign-summary">
            <h3>Your Reign in Numbers</h3>
            <div class="summary-stats">
              <div class="stat">
                <span class="stat-number">{{ reignSummary.totalActions }}</span>
                <span class="stat-label">Decisions Made</span>
              </div>
              <div class="stat positive">
                <span class="stat-number">{{ reignSummary.positiveActions }}</span>
                <span class="stat-label">Popular Choices</span>
              </div>
              <div class="stat negative">
                <span class="stat-number">{{ reignSummary.negativeActions }}</span>
                <span class="stat-label">Unpopular Choices</span>
              </div>
              <div class="stat deaths" v-if="reignSummary.deaths > 0">
                <span class="stat-number">{{ reignSummary.deaths }}</span>
                <span class="stat-label">Lives Lost</span>
              </div>
            </div>
          </div>

          <!-- Deaths Summary -->
          <div v-if="deadCharacters.length > 0" class="deaths-summary">
            <h3>Those Who Perished</h3>
            <div class="death-list">
              <div v-for="character in deadCharacters" :key="character.id" class="death-entry">
                <span class="death-name">{{ character.name }}</span>
                <span class="death-reason" v-if="character.deathReason">{{ character.deathReason }}</span>
                <span class="death-reason" v-else>Fate unknown</span>
              </div>
            </div>
          </div>

          <!-- Key Actions Summary -->
          <div v-if="significantActions.length > 0" class="actions-summary">
            <h3>Key Decisions</h3>
            <div class="action-list">
              <div v-for="action in significantActions" :key="`${action.npc}-${action.turn}`" class="action-entry">
                <span class="action-turn">Turn {{ action.turn }}:</span>
                <div class="action-details">
                  <span class="action-description">{{ action.choice }}</span>
                  <span v-if="action.consequence" class="action-consequence">{{ action.consequence }}</span>
                </div>
                <span class="action-impact" :class="{ positive: action.popularityChange > 0, negative: action.popularityChange < 0 }">
                  {{ action.popularityChange > 0 ? '+' : '' }}{{ action.popularityChange }}
                </span>
              </div>
            </div>
          </div>
          <div v-else-if="reignSummary.totalActions === 0" class="no-actions">
            <p>No significant actions were recorded during your brief reign.</p>
          </div>
        </div>
        <GameButton @click="$emit('restart')" class="restart-button">
          Play Again
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameButton from './GameButton.vue'

const props = defineProps({
  popularity: Number,
  endingType: String,
  actionHistory: Array,
  characters: Array
})

defineEmits(['restart'])

const endTitle = computed(() => {
  switch (props.endingType) {
    case 'rebellion':
      return 'The People Have Risen!'
    case 'victory':
      return 'A Glorious Reign!'
    case 'neutral':
      return 'A Mixed Legacy'
    default:
      return 'The End'
  }
})

const endDescription = computed(() => {
  switch (props.endingType) {
    case 'rebellion':
      return 'Your popularity fell too low and the people have revolted. Your reign has come to a violent end. Perhaps different choices could have saved your throne...'
    case 'victory':
      return 'You have successfully restored honor to the crown! The people love you and your kingdom prospers. You are remembered as a wise and just ruler.'
    case 'neutral':
      return 'Your reign was neither triumphant nor catastrophic. Some respect you, others question your decisions. History will be the final judge of your legacy.'
    default:
      return 'Your story has ended.'
  }
})

const deadCharacters = computed(() => {
  if (!props.characters) return []
  return props.characters.filter(char => char.status === 'dead')
})

const significantActions = computed(() => {
  if (!props.actionHistory || props.actionHistory.length === 0) return []
  
  // Get major actions (high popularity impact or important story moments)
  return props.actionHistory
    .map((action, originalIndex) => ({
      ...action,
      originalTurn: originalIndex + 1
    }))
    .filter(action => Math.abs(action.popularityChange || 0) >= 10 || action.isStoryMoment)
    .slice(-8) // Show last 8 significant actions
    .map(action => ({
      npc: action.npc || 'Unknown',
      choice: action.text || action.choice || action.description || 'Unknown action',
      consequence: action.consequence || '',
      popularityChange: action.popularityChange || 0,
      turn: action.originalTurn
    }))
})

const reignSummary = computed(() => {
  if (!props.actionHistory) {
    return {
      totalActions: 0,
      positiveActions: 0,
      negativeActions: 0,
      deaths: deadCharacters.value.length
    }
  }
  
  const totalActions = props.actionHistory.length
  const positiveActions = props.actionHistory.filter(a => (a.popularityChange || 0) > 0).length
  const negativeActions = props.actionHistory.filter(a => (a.popularityChange || 0) < 0).length
  
  return {
    totalActions,
    positiveActions,
    negativeActions,
    deaths: deadCharacters.value.length
  }
})
</script>

<style scoped>
.end-screen {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 2rem;
  box-sizing: border-box;
}

.end-overlay {
  background: rgba(0, 0, 0, 0.9);
  padding: 2rem;
  border-radius: 10px;
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
}

.end-content {
  text-align: center;
}

.end-title {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  color: #ff4444;
}

.end-screen[data-ending="victory"] .end-title {
  color: #44ff44;
}

.end-screen[data-ending="neutral"] .end-title {
  color: #ffff44;
}

.end-text {
  color: white;
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  text-align: center;
}

.end-text p {
  margin-bottom: 1.5rem;
}

.final-popularity {
  font-weight: bold;
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 2rem;
}

.restart-button {
  font-size: 1.7rem;
  padding: 1.2rem 2.5rem;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

/* Reign Summary Styles */
.reign-summary {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reign-summary h3 {
  color: #ffd700;
  margin-bottom: 1rem;
  font-size: 1.7rem;
  text-align: center;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  display: block;
  font-size: 2.2rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  display: block;
  font-size: 1.1rem;
  color: #ccc;
  margin-top: 0.2rem;
}

.stat.positive .stat-number {
  color: #4ade80;
}

.stat.negative .stat-number {
  color: #f87171;
}

.stat.deaths .stat-number {
  color: #ff6b6b;
}

/* Deaths Summary Styles */
.deaths-summary {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(139, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.deaths-summary h3 {
  color: #ff6b6b;
  margin-bottom: 1rem;
  font-size: 1.7rem;
  text-align: center;
}

.death-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.death-entry {
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  border-left: 3px solid #ff6b6b;
}

.death-name {
  font-weight: bold;
  color: #fff;
  font-size: 1.4rem;
}

.death-reason {
  color: #ffcccb;
  font-style: italic;
  margin-top: 0.3rem;
  font-size: 1.1rem;
}

/* Actions Summary Styles */
.actions-summary {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(0, 0, 139, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 100, 255, 0.3);
}

.actions-summary h3 {
  color: #87ceeb;
  margin-bottom: 1rem;
  font-size: 1.7rem;
  text-align: center;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.action-entry {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  padding: 0.6rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  align-items: center;
}

.action-turn {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
  white-space: nowrap;
}

.action-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.action-description {
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
}

.action-consequence {
  color: #ccc;
  font-size: 1rem;
  font-style: italic;
}

.action-impact {
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  min-width: 40px;
}

.action-impact.positive {
  color: #4ade80;
}

.action-impact.negative {
  color: #f87171;
}

.no-actions {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .end-screen {
    padding: 1rem;
  }
  
  .end-overlay {
    padding: 1.5rem;
    min-height: calc(100vh - 2rem);
  }
  
  .end-title {
    font-size: 2.8rem;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-entry {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    text-align: center;
  }
  
  .action-turn {
    text-align: center;
  }
  
  .action-details {
    text-align: center;
  }
  
  .action-impact {
    text-align: center;
  }
}
</style>
