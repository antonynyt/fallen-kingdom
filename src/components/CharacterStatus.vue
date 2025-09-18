<template>
  <div class="character-status-overlay" v-if="visible" @click="$emit('close')">
    <div class="character-status-panel" @click.stop>
      <div class="panel-header">
        <h2>Kingdom Characters</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      
      <div class="character-list">
        <div v-if="characters.length === 0" class="no-characters">
          No characters encountered yet.
        </div>
        
        <div 
          v-for="character in characters" 
          :key="character.id"
          class="character-card"
          :class="{ 'dead': character.status === 'dead' }"
        >
          <div class="character-avatar">
            <img :src="character.image" :alt="character.name" />
            <div v-if="character.status === 'dead'" class="death-overlay">💀</div>
            <div v-if="character.isAIGenerated" class="ai-badge">AI</div>
          </div>
          
          <div class="character-info">
            <h3 class="character-name">{{ character.name }}</h3>
            <p class="character-role">{{ character.role }}</p>
            
            <div class="affinity-section">
              <div class="affinity-label">
                Affinity: {{ character.affinity }}%
                <span class="affinity-status">{{ getAffinityStatus(character.affinity) }}</span>
              </div>
              <div class="affinity-bar">
                <div 
                  class="affinity-fill" 
                  :style="{ width: character.affinity + '%' }"
                  :class="getAffinityClass(character.affinity)"
                ></div>
              </div>
            </div>
            
            <div class="character-status">
              <span class="status-badge" :class="character.status">
                {{ getStatusText(character) }}
              </span>
              <div v-if="character.deathReason" class="status-reason">
                💀 {{ character.deathReason }}
              </div>
              <div v-if="character.exileReason" class="status-reason">
                � {{ character.exileReason }}
              </div>
              <div v-if="character.creationReason" class="status-reason">
                ✨ {{ character.creationReason }}
              </div>
            </div>
            
            <div v-if="character.interactions && character.interactions.length > 0" class="interactions">
              <h4>Recent Interactions:</h4>
              <div 
                v-for="(interaction, index) in character.interactions.slice(-2)" 
                :key="index"
                class="interaction"
              >
                <span class="interaction-turn">Turn {{ interaction.turn }}:</span>
                <span class="interaction-choice">{{ interaction.choice }}</span>
                <span 
                  class="interaction-affinity" 
                  :class="interaction.affinityChange > 0 ? 'positive' : 'negative'"
                >
                  {{ interaction.affinityChange > 0 ? '+' : '' }}{{ interaction.affinityChange }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  characters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const getAffinityStatus = (affinity) => {
  if (affinity >= 80) return 'Devoted'
  if (affinity >= 60) return 'Loyal'
  if (affinity >= 40) return 'Neutral'
  if (affinity >= 20) return 'Displeased'
  return 'Hostile'
}

const getAffinityClass = (affinity) => {
  if (affinity >= 80) return 'devoted'
  if (affinity >= 60) return 'loyal'
  if (affinity >= 40) return 'neutral'
  if (affinity >= 20) return 'displeased'
  return 'hostile'
}

const getStatusText = (character) => {
  switch (character.status) {
    case 'alive': return '❤️ Alive'
    case 'dead': return '💀 Dead'
    case 'exiled': return '🚪 Exiled'
    default: return '❓ Unknown'
  }
}
</script>

<style scoped>
.character-status-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.character-status-panel {
  background: rgba(20, 20, 30, 0.95);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 0;
  max-width: 800px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
}

.panel-header {
  background: rgba(255, 215, 0, 0.1);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #ffd700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  color: #ffd700;
  margin: 0;
  font-size: 2.2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.close-button {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 2.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #fff;
}

.character-list {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
  display: grid;
  gap: 1rem;
}

.no-characters {
  color: #aaa;
  text-align: center;
  font-style: italic;
  padding: 2rem;
}

.character-card {
  background: rgba(40, 40, 50, 0.8);
  border: 1px solid #555;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
}

.character-card:hover {
  border-color: #ffd700;
  background: rgba(50, 50, 60, 0.9);
}

.character-card.dead {
  opacity: 0.7;
  background: rgba(60, 40, 40, 0.8);
  border-color: #800;
}

.character-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #666;
}

.death-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border-radius: 8px;
}

.ai-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #4CAF50;
  color: white;
  font-size: 0.9rem;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: bold;
}

.character-info {
  flex: 1;
  min-width: 0;
}

.character-name {
  color: #ffd700;
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.character-role {
  color: #aaa;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-style: italic;
}

.affinity-section {
  margin-bottom: 1rem;
}

.affinity-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
  font-size: 1.1rem;
}

.affinity-status {
  font-weight: bold;
  font-size: 1rem;
}

.affinity-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.affinity-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 6px;
}

.affinity-fill.devoted {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.affinity-fill.loyal {
  background: linear-gradient(90deg, #2196F3, #4CAF50);
}

.affinity-fill.neutral {
  background: linear-gradient(90deg, #FFC107, #FF9800);
}

.affinity-fill.displeased {
  background: linear-gradient(90deg, #FF9800, #F44336);
}

.affinity-fill.hostile {
  background: linear-gradient(90deg, #F44336, #D32F2F);
}

.character-status {
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
}

.status-badge.alive {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.status-badge.dead {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.status-badge.exiled {
  background: rgba(156, 39, 176, 0.2);
  color: #9C27B0;
}

.status-reason {
  font-size: 0.9rem;
  color: #aaa;
  font-style: italic;
  margin-top: 0.25rem;
  padding: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.interactions {
  border-top: 1px solid #555;
  padding-top: 0.75rem;
}

.interactions h4 {
  color: #ccc;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.interaction {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  align-items: center;
}

.interaction-turn {
  color: #aaa;
  font-weight: bold;
  min-width: 60px;
}

.interaction-choice {
  color: #e0e0e0;
  flex: 1;
  font-style: italic;
}

.interaction-affinity {
  font-weight: bold;
  min-width: 30px;
  text-align: right;
}

.interaction-affinity.positive {
  color: #4CAF50;
}

.interaction-affinity.negative {
  color: #F44336;
}

/* Scrollbar styling */
.character-list::-webkit-scrollbar {
  width: 8px;
}

.character-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.character-list::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.character-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}
</style>
