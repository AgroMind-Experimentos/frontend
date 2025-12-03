import {WeatherApi} from '../infraestructure/weather-api.js'

export class WeatherService{
    constructor(){
        this.weatherApi = new WeatherApi()
    }
    async getWeather(location = null){
        return this.weatherApi.getWeather(location)
    }
}