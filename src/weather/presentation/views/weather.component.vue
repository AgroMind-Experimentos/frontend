<script setup lang="js">
import { WeatherService } from '../../application/weather.service.js'
import { onMounted, ref, computed } from 'vue'
import AppLayout from '../../../shared/presentation/components/app-layout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const weatherData = ref(null)
const loading = ref(true)
const error = ref(null)
const locationInput = ref('Peru')
const currentLocation = ref('Peru')

const weather = new WeatherService()

onMounted(async () => {
  await loadWeather()
})

const loadWeather = async () => {
  loading.value = true
  error.value = null
  try {
    const result = await weather.getWeather(currentLocation.value)
    weatherData.value = result
  } catch (err) {
    error.value = err.message || 'Error al cargar el clima'
  } finally {
    loading.value = false
  }
}

const refreshWeather = () => {
  loadWeather()
}

const searchLocation = () => {
  if (locationInput.value.trim()) {
    currentLocation.value = locationInput.value.trim()
    loadWeather()
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchLocation()
  }
}

// Información agrícola dinámica según temperatura
const agriculturalInfo = computed(() => {
  if (!weatherData.value || weatherData.value.temperature === undefined) {
    return {
      gradient: 'linear-gradient(135deg, #6c757d, #868e96)',
      icon: 'pi-info-circle',
      iconColor: '#6c757d',
      title: 'Información Agrícola',
      tips: [
        { icon: 'pi-info-circle', color: '#17a2b8', text: 'Esperando datos del clima...' }
      ]
    }
  }

  const temp = weatherData.value.temperature

  // Muy frío (< 5°C)
  if (temp < 5) {
    return {
      gradient: 'linear-gradient(135deg, #6495ED, #87CEEB)',
      icon: 'pi-bolt',
      iconColor: '#4169E1',
      title: 'Alerta: Temperaturas Muy Bajas',
      tips: [
        { icon: 'pi-exclamation-triangle', color: '#dc3545', text: 'Riesgo de heladas. Protege cultivos sensibles con coberturas' },
        { icon: 'pi-times-circle', color: '#dc3545', text: 'No realizar riegos, el agua puede congelarse' },
        { icon: 'pi-shield', color: '#ffc107', text: 'Considera usar mantas térmicas o sistemas de calefacción' },
        { icon: 'pi-eye', color: '#17a2b8', text: 'Monitorea cultivos de raíces y tubérculos constantemente' }
      ]
    }
  }

  // Frío (5°C - 15°C)
  if (temp >= 5 && temp < 15) {
    return {
      gradient: 'linear-gradient(135deg, #4FC3F7, #81D4FA)',
      icon: 'pi-cloud',
      iconColor: '#0288D1',
      title: 'Temperatura Fresca',
      tips: [
        { icon: 'pi-check-circle', color: '#28a745', text: 'Condiciones óptimas para cultivos de clima frío (lechugas, espinacas)' },
        { icon: 'pi-calendar', color: '#17a2b8', text: 'Buen momento para plantar brócoli, coliflor y coles' },
        { icon: 'pi-times-circle', color: '#dc3545', text: 'Evita plantar cultivos tropicales' },
        { icon: 'pi-sun', color: '#ffc107', text: 'Asegura que los cultivos reciban suficiente luz solar' }
      ]
    }
  }

  // Templado (15°C - 25°C)
  if (temp >= 15 && temp < 25) {
    return {
      gradient: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
      icon: 'pi-check-circle',
      iconColor: '#2E7D32',
      title: 'Condiciones Ideales',
      tips: [
        { icon: 'pi-thumbs-up', color: '#28a745', text: 'Temperatura perfecta para la mayoría de cultivos' },
        { icon: 'pi-calendar-plus', color: '#28a745', text: 'Excelente para siembra y trasplantes' },
        { icon: 'pi-leaf', color: '#28a745', text: 'Condiciones óptimas para crecimiento vegetativo' },
        { icon: 'pi-sun', color: '#ffc107', text: 'Ideal para aplicar fertilizantes y tratamientos foliares' }
      ]
    }
  }

  // Cálido (25°C - 32°C)
  if (temp >= 25 && temp < 32) {
    return {
      gradient: 'linear-gradient(135deg, #FF9800, #FFB74D)',
      icon: 'pi-sun',
      iconColor: '#F57C00',
      title: 'Temperatura Cálida',
      tips: [
        { icon: 'pi-check-circle', color: '#28a745', text: 'Ideal para cultivos de verano (tomates, pimientos, sandías)' },
        { icon: 'pi-tint', color: '#17a2b8', text: 'Aumenta la frecuencia de riego, especialmente por la mañana' },
        { icon: 'pi-calendar', color: '#ffc107', text: 'Considera aplicar mulch para retener humedad del suelo' },
        { icon: 'pi-eye', color: '#17a2b8', text: 'Monitorea signos de estrés hídrico en las plantas' }
      ]
    }
  }

  // Muy caliente (> 32°C)
  return {
    gradient: 'linear-gradient(135deg, #FF5722, #FF7043)',
    icon: 'pi-exclamation-triangle',
    iconColor: '#D84315',
    title: 'Alerta: Temperaturas Muy Altas',
    tips: [
      { icon: 'pi-exclamation-triangle', color: '#dc3545', text: 'Riesgo de estrés térmico en plantas. Aumenta sombreado' },
      { icon: 'pi-tint', color: '#dc3545', text: 'Riega temprano en la mañana o al atardecer, nunca a mediodía' },
      { icon: 'pi-times-circle', color: '#dc3545', text: 'Evita trasplantes y podas durante las horas más calurosas' },
      { icon: 'pi-shield', color: '#ffc107', text: 'Protege cultivos sensibles con mallas de sombra (30-50%)' },
      { icon: 'pi-eye', color: '#17a2b8', text: 'Vigila plagas, se reproducen más rápido con el calor' }
    ]
  }
})
</script>

<template>
  <AppLayout>
    <div class="weather-container">
      <div class="header">
        <h1>Información del Clima</h1>
        <p>Datos meteorológicos actuales para la gestión agrícola</p>
      </div>

      <!-- Buscador de ubicación -->
      <div class="location-search-container">
        <Card class="location-search-card">
          <template #content>
            <div class="search-wrapper">
              <div class="search-icon-wrapper">
                <i class="pi pi-map-marker"></i>
              </div>
              <div class="search-input-group">
                <label for="location-input" class="search-label">Ubicación</label>
                <div class="input-with-button">
                  <InputText
                      id="location-input"
                      v-model="locationInput"
                      placeholder="Ej: Lima, Puno"
                      @keypress="handleKeyPress"
                      class="location-input"
                      :disabled="loading"
                  />
                  <Button
                      label="Buscar"
                      icon="pi pi-search"
                      @click="searchLocation"
                      :loading="loading"
                      class="search-button"
                  />
                </div>
                <small class="search-hint">
                  <i class="pi pi-info-circle"></i>
                  Ingresa ciudad, región
                </small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="actions">
        <Button
          label="Actualizar"
          icon="pi pi-refresh"
          @click="refreshWeather"
          :loading="loading"
          class="p-button-outlined"
        />
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando información del clima...</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          label="Reintentar"
          icon="pi pi-refresh"
          @click="refreshWeather"
          class="p-button-outlined"
        />
      </div>

      <!-- Información del clima -->
      <div v-else class="weather-content">
        <Card class="weather-card">
          <template #header>
            <div class="weather-header">
              <i class="pi pi-sun weather-icon"></i>
              <h2>Condiciones Actuales</h2>
            </div>
          </template>
          <template #content>
            <div class="weather-info">
              <div class="main-weather">
                <div class="temperature">
                  <span class="temp-value">{{ weatherData.temperature }}°C</span>
                  <span class="condition">{{ weatherData.condition }}</span>
                </div>
              </div>

              <div class="weather-details" v-if="weatherData.humidity || weatherData.windSpeed">
                <div class="detail-item" v-if="weatherData.humidity">
                  <i class="pi pi-tint"></i>
                  <span>Humedad: {{ weatherData.humidity }}%</span>
                </div>
                <div class="detail-item" v-if="weatherData.windSpeed">
                  <i class="pi pi-flag"></i>
                  <span>Viento: {{ weatherData.windSpeed }} km/h</span>
                </div>
                <div class="detail-item" v-if="weatherData.location">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ weatherData.location }}</span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Información adicional para agricultura -->
        <Card class="agricultural-info" :style="{ background: agriculturalInfo.gradient }">
          <template #header>
            <div class="info-header">
              <i class="pi" :class="agriculturalInfo.icon" :style="{ color: agriculturalInfo.iconColor }"></i>
              <h3>{{ agriculturalInfo.title }}</h3>
            </div>
          </template>
          <template #content>
            <div class="agricultural-tips">
              <div
                v-for="(tip, index) in agriculturalInfo.tips"
                :key="index"
                class="tip-item"
              >
                <i class="pi" :class="tip.icon" :style="{ color: tip.color }"></i>
                <span>{{ tip.text }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>


  </AppLayout>
</template>

<style scoped>
.weather-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 2rem;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

/* Estilos del buscador de ubicación */
.location-search-container {
  margin-bottom: 1.5rem;
}

.location-search-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fef9 100%) !important;
  border: 2px solid #e8f5e9 !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1) !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.location-search-card:hover {
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.15) !important;
  transform: translateY(-2px);
}

.search-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 0.5rem;
}

.search-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border-radius: 12px;
  flex-shrink: 0;
  margin-top: 1.5rem;
}

.search-icon-wrapper i {
  font-size: 1.5rem;
  color: white;
}

.search-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-label {
  font-weight: 600;
  color: #2c5530;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.input-with-button {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.location-input {
  flex: 1;
  height: 48px;
  border: 2px solid #e0e0e0 !important;
  border-radius: 12px !important;
  padding: 0 1rem !important;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.location-input:hover {
  border-color: #4CAF50 !important;
}

.location-input:focus {
  border-color: #4CAF50 !important;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1) !important;
}

.location-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.search-button {
  height: 48px;
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #4CAF50, #66BB6A) !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #45a049, #5cb860) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
}

.search-button:active {
  transform: translateY(0);
}

.search-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.search-hint i {
  color: #4CAF50;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.loading-state p, .error-state p {
  margin: 1rem 0;
  color: #666;
  font-size: 1.1rem;
}

.weather-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.weather-card {
  background: linear-gradient(135deg, #4CAF50, #66BB6A) !important;
  color: white !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3) !important;
}

.weather-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: white;
}

.weather-icon {
  font-size: 2.5rem;
  color: #FFF176;
}

.weather-header h2 {
  margin: 0;
  color: white;
}

.weather-info {
  padding: 1rem;
}

.main-weather {
  text-align: center;
  margin-bottom: 2rem;
}

.temperature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.temp-value {
  font-size: 4rem;
  font-weight: bold;
  color: white;
}

.condition {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: capitalize;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.detail-item i {
  color: #FFF176;
}

.agricultural-info {
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease;
  overflow: hidden;
}

.agricultural-info:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.info-header i {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.info-header h3 {
  margin: 0;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.agricultural-tips {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #333;
  line-height: 1.6;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.tip-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tip-item i {
  margin-top: 0.25rem;
  flex-shrink: 0;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .weather-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .temp-value {
    font-size: 3rem;
  }

  .weather-container {
    padding: 0.5rem;
  }

  .search-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .search-icon-wrapper {
    align-self: center;
    margin-top: 0;
  }

  .input-with-button {
    flex-direction: column;
    gap: 0.5rem;
  }

  .location-input,
  .search-button {
    width: 100%;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .header p {
    font-size: 1rem;
  }
}
</style>