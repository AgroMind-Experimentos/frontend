import axios from 'axios'
import {WeatherAssembler} from './weather.assembler.js'

export class WeatherApi{
    baseUrl = import.meta.env.VITE_WEATHER_API_BASE_URL;
    apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    location = import.meta.env.VITE_WEATHER_LOCATION;

    async getWeather(customLocation = null){
        const locationToUse = customLocation || this.location;
        const endpoint = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${locationToUse}&aqi=yes`;
        const response = await axios.get(endpoint);
        return WeatherAssembler.toEntityFromResponse(response.data);
    }
}