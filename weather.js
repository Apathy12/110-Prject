// Weather API Configuration
const API_KEY = 'b8226e7e8a7e47648d402959250810'; // Replace with your weatherapi.com API key
const API_BASE_URL = 'https://api.weatherapi.com/v1';

// Four major cities to display
const MAJOR_CITIES = ['London', 'New York', 'Tokyo', 'Sydney'];

// Weather condition mappings for gradients and icons
const weatherConditions = {
    'sunny': { gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', icon: '☀️' },
    'clear': { gradient: 'linear-gradient(135deg, #87CEEB, #4682B4)', icon: '☀️' },
    'partly-cloudy': { gradient: 'linear-gradient(135deg, #B0C4DE, #87CEEB)', icon: '⛅' },
    'cloudy': { gradient: 'linear-gradient(135deg, #708090, #A9A9A9)', icon: '☁️' },
    'overcast': { gradient: 'linear-gradient(135deg, #696969, #808080)', icon: '☁️' },
    'rainy': { gradient: 'linear-gradient(135deg, #4682B4, #5F9EA0)', icon: '🌧️' },
    'stormy': { gradient: 'linear-gradient(135deg, #2F4F4F, #4682B4)', icon: '⛈️' },
    'snowy': { gradient: 'linear-gradient(135deg, #F0F8FF, #B0E0E6)', icon: '❄️' },
    'foggy': { gradient: 'linear-gradient(135deg, #D3D3D3, #C0C0C0)', icon: '🌫️' }
};

// Get weather condition type from API data
function getWeatherCondition(condition) {
    const text = condition.toLowerCase();
    if (text.includes('sun') || text.includes('clear')) return 'sunny';
    if (text.includes('partly') || text.includes('few clouds')) return 'partly-cloudy';
    if (text.includes('cloud')) return 'cloudy';
    if (text.includes('overcast')) return 'overcast';
    if (text.includes('rain') || text.includes('drizzle')) return 'rainy';
    if (text.includes('storm') || text.includes('thunder')) return 'stormy';
    if (text.includes('snow') || text.includes('blizzard')) return 'snowy';
    if (text.includes('fog') || text.includes('mist')) return 'foggy';
    return 'cloudy'; // default
}

// Apply gradient and icon to forecast day
function applyWeatherStyling(dayElement, condition) {
    const weatherType = getWeatherCondition(condition);
    const weatherData = weatherConditions[weatherType];
    
    dayElement.style.background = weatherData.gradient;
    dayElement.style.color = '#fff';
    dayElement.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    
    return weatherData.icon;
}

// Fetch current weather
async function fetchCurrentWeather(location) {
    try {
        const response = await fetch(`${API_BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`);
        if (!response.ok) throw new Error('Weather data not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

// Fetch weather forecast
async function fetchWeatherForecast(location) {
    try {
        const response = await fetch(`${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=no&alerts=no`);
        if (!response.ok) throw new Error('Forecast data not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    const location = document.getElementById('current-location');
    const temp = document.getElementById('current-temp');
    const condition = document.getElementById('current-condition');

    if (location) location.textContent = `${data.location.name}, ${data.location.country}`;
    if (temp) temp.textContent = `${Math.round(data.current.temp_c)}°C`;
    if (condition) condition.textContent = data.current.condition.text;
}

// Update forecast display
function updateForecast(data) {
    const forecastDays = data.forecast.forecastday;
    const dayNames = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get all forecast day elements
    const forecastDayElements = document.querySelectorAll('.forecast-day');

    forecastDays.forEach((day, index) => {
        if (index >= 7) return; // Limit to 7 days

        const dayElement = forecastDayElements[index];
        const dayIcon = document.getElementById(`day-icon-${index}`);
        const dayTemp = document.getElementById(`day-temp-${index}`);
        const nightIcon = document.getElementById(`night-icon-${index}`);
        const nightTemp = document.getElementById(`night-temp-${index}`);

        if (dayElement && dayIcon && dayTemp && nightIcon && nightTemp) {
            // Update day data
            const dayCondition = day.day.condition.text;
            const dayIconEmoji = applyWeatherStyling(dayElement, dayCondition);
            dayIcon.textContent = dayIconEmoji;
            dayTemp.textContent = `${Math.round(day.day.maxtemp_c)}°C`;

            // Update night data
            nightIcon.textContent = '🌙';
            nightTemp.textContent = `${Math.round(day.day.mintemp_c)}°C`;

            // Update day name
            const dayName = dayElement.querySelector('h4');
            if (dayName) {
                dayName.textContent = dayNames[index];
            }
        }
    });
}

// Show error message
function showError(message) {
    const currentLocation = document.getElementById('current-location');
    const currentTemp = document.getElementById('current-temp');
    const currentCondition = document.getElementById('current-condition');

    if (currentLocation) currentLocation.textContent = 'Error';
    if (currentTemp) currentTemp.textContent = '--°C';
    if (currentCondition) currentCondition.textContent = message;
}

// Clear forecast display
function clearForecast() {
    const forecastDayElements = document.querySelectorAll('.forecast-day');
    forecastDayElements.forEach((dayElement, index) => {
        const dayIcon = document.getElementById(`day-icon-${index}`);
        const dayTemp = document.getElementById(`day-temp-${index}`);
        const nightIcon = document.getElementById(`night-icon-${index}`);
        const nightTemp = document.getElementById(`night-temp-${index}`);

        if (dayIcon) dayIcon.textContent = '--';
        if (dayTemp) dayTemp.textContent = '--°C';
        if (nightIcon) nightIcon.textContent = '--';
        if (nightTemp) nightTemp.textContent = '--°C';
        
        // Reset styling
        dayElement.style.background = '';
        dayElement.style.color = '';
        dayElement.style.boxShadow = '';
    });
}

// Main search function
async function searchWeather() {
    const locationInput = document.getElementById('location');
    const location = locationInput.value.trim();

    if (!location) {
        showError('Please enter a location');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('API key not configured. Please add your weatherapi.com API key.');
        return;
    }

    try {
        // Show loading state
        showError('Loading...');
        clearForecast();

        // Fetch both current weather and forecast
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(location),
            fetchWeatherForecast(location)
        ]);

        // Update displays
        updateCurrentWeather(currentData);
        updateForecast(forecastData);

    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Location not found. Please try a different city.');
    }
}

// Load weather for major cities
async function loadMajorCitiesWeather() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('API key not configured, skipping major cities weather');
        return;
    }

    try {
        const weatherPromises = MAJOR_CITIES.map(city => fetchCurrentWeather(city));
        const weatherData = await Promise.all(weatherPromises);
        
        weatherData.forEach((data, index) => {
            updateCityCard(index, data);
        });
    } catch (error) {
        console.error('Error loading major cities weather:', error);
    }
}

// Update individual city card
function updateCityCard(index, data) {
    const cityName = document.getElementById(`city-name-${index}`);
    const cityTemp = document.getElementById(`city-temp-${index}`);
    const cityCondition = document.getElementById(`city-condition-${index}`);
    const cityCard = document.getElementById(`city-card-${index}`);

    if (cityName) cityName.textContent = data.location.name;
    if (cityTemp) cityTemp.textContent = `${Math.round(data.current.temp_c)}°C`;
    if (cityCondition) cityCondition.textContent = data.current.condition.text;
    
    // Apply weather styling to city card
    if (cityCard) {
        const weatherType = getWeatherCondition(data.current.condition.text);
        const weatherData = weatherConditions[weatherType];
        cityCard.style.background = weatherData.gradient;
        cityCard.style.color = '#fff';
        cityCard.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search');
    const locationInput = document.getElementById('location');

    if (searchButton) {
        searchButton.addEventListener('click', searchWeather);
    }
    
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    }

    // Load major cities weather on page load
    loadMajorCitiesWeather();
});