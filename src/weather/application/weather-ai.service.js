export class WeatherAiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY
    this.model = import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-flash-lite-latest'
    const defaultUrl = `/google-ai/v1beta/models/${this.model}:generateContent`
    this.apiUrl = import.meta.env.VITE_GOOGLE_AI_URL || defaultUrl
  }

  async getWeatherComments(temperature, condition) {
    if (!this.apiKey) throw new Error('Google AI API key not configured')

    const tempRange = this._getTempRange(temperature)
    const prompt = `Eres un experto agrícola. El clima actual es:
- Temperatura: ${temperature}°C (${tempRange})
- Condición: ${condition}

Genera exactamente 4 consejos agrícolas prácticos y concisos para agricultores en esta condición climática. Responde ÚNICAMENTE con un JSON válido con este formato exacto, sin texto adicional:
{
  "title": "Título descriptivo del estado climático para agricultores",
  "tips": [
    "Consejo 1",
    "Consejo 2",
    "Consejo 3",
    "Consejo 4"
  ]
}`

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
    }

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const message = err?.error?.message || `Error de IA: ${response.status}`
      throw new Error(`${message}. Comprueba que el modelo sea compatible con tu cuenta o configura VITE_GOOGLE_AI_MODEL=gemini-flash-lite-latest`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!text) {
      throw new Error('Respuesta de IA inválida: no se encontró texto en la respuesta')
    }

    const jsonText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(jsonText)
  }

  _getTempRange(temp) {
    if (temp < 5) return 'muy frío'
    if (temp < 15) return 'frío'
    if (temp < 25) return 'templado'
    if (temp < 32) return 'cálido'
    return 'muy caliente'
  }
}
