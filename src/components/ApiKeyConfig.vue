<template>
  <div class="api-config" v-if="!hasApiKey">
    <div class="config-overlay">
      <div class="config-content">
        <h2>Configure AI Integration</h2>
        <p>To enhance the game experience with dynamic AI-generated content, please enter your Google Gemini API key:</p>
        <div class="input-group">
          <input 
            v-model="apiKeyInput"
            type="password"
            placeholder="Enter your Gemini API key"
            class="api-input"
            @keyup.enter="saveApiKey"
          />
          <GameButton @click="saveApiKey" :disabled="!apiKeyInput.trim()">
            Set API Key
          </GameButton>
        </div>
        <div class="help-text">
          <p><strong>Optional:</strong> The game works without an API key using predefined content.</p>
          <p>With AI: NPCs react dynamically to your past decisions</p>
          <p>Without AI: NPCs use static but engaging dialogue</p>
        </div>
        <GameButton @click="skipApiKey" class="skip-button">
          Skip AI Integration
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GameButton from './GameButton.vue'
import { useAI } from '../composables/useAI'

const emit = defineEmits(['configured'])

const { setApiKey } = useAI()
const apiKeyInput = ref('')
const hasApiKey = ref(false)

onMounted(() => {
  // Check if API key is already stored
  const stored = localStorage.getItem('gemini_api_key')
  if (stored) {
    setApiKey(stored)
    hasApiKey.value = true
    emit('configured')
  }
})

const saveApiKey = () => {
  if (apiKeyInput.value.trim()) {
    localStorage.setItem('gemini_api_key', apiKeyInput.value.trim())
    setApiKey(apiKeyInput.value.trim())
    hasApiKey.value = true
    emit('configured')
  }
}

const skipApiKey = () => {
  hasApiKey.value = true
  emit('configured')
}
</script>

<style scoped>
.api-config {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.config-overlay {
  background: rgba(20, 20, 30, 0.95);
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid #ffd700;
  max-width: 600px;
  text-align: center;
}

.config-content h2 {
  color: #ffd700;
  margin-bottom: 1rem;
}

.config-content p {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.api-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #444;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.api-input:focus {
  outline: none;
  border-color: #ffd700;
}

.help-text {
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.help-text p {
  margin-bottom: 0.5rem;
}

.skip-button {
  background: rgba(100, 100, 100, 0.5);
}

.skip-button:hover {
  background: rgba(150, 150, 150, 0.7);
}
</style>
