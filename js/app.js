/**
 * Weather Dashboard Application
 * Main application logic and weather data management
 */

class WeatherApp {
    constructor() {
        this.cache = new Map();
        this.currentWeatherData = null;
        this.searchDebounceTimer = null;
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Input elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        
        // Display elements
        this.weatherCard = document.getElementById('weatherCard');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Weather data elements
        this.cityName = document.getElementById('cityName');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.description = document.getElementById('description');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.visibility = document.getElementById('visibility');
        this.cloudiness = document.getElementById('cloudiness');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        this.lastUpdated = document.getElementById('lastUpdated');

        // Verify all elements exist
        this.validateElements();
    }

    /**
     * Validate that all required DOM elements exist
     */
    validateElements() {
        const requiredElements = [
            'cityInput', 'searchBtn', 'weatherCard', 'errorMessage', 
            'loadingIndicator', 'cityName', 'weatherIcon', 'temperature',
            'description', 'feelsLike', 'humidity', 'windSpeed', 'pressure'
        ];

        const missing = requiredElements.filter(elementId => !document.getElementById(elementId));
        
        if (missing.length > 0) {
            console.error('Missing required DOM elements:', missing);
            throw new Error(`Missing DOM elements: ${missing.join(', ')}`);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Real-time search with debouncing
        this.cityInput.addEventListener('input', () => {
            clearTimeout(this.searchDebounceTimer);
            this.hideError();
            
            // Optional: Implement real-time suggestions here
            this.searchDebounceTimer = setTimeout(() => {
                const value = this.cityInput.value.trim();
                if (value.length > 2) {
                    // Could implement search suggestions here
                    console.log('Search suggestion for:', value);
                }
            }, CONFIG.UI.DEBOUNCE_DELAY);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideError();
                this.cityInput.blur();
            }
        });

        // Window events
        window.addEventListener('online', () => {
            console.log('Connection restored');
            this.hideError();
        });

        window.addEventListener('offline', () => {
            this.showError('No internet connection. Please check your network.');
        });
    }

    /**
     * Initialize the application
     */
    async initializeApp() {
        try {
            // Validate API configuration
            if (!ConfigUtils.isValidApiKey()) {
                throw new Error(CONFIG.ERRORS.API_KEY_MISSING);
            }

            // Load last searched city from localStorage if available
            const lastSearch = this.getLastSearch();
            if (lastSearch) {
                this.cityInput.value = lastSearch;
                await this.fetchWeatherData(lastSearch);
            } else {
                // Load default city
                this.cityInput.value = CONFIG.APP.DEFAULT_CITY;
                await this.fetchWeatherData(CONFIG.APP.DEFAULT_CITY);
            }

            // Optionally try to get user's location
            if (CONFIG.FEATURES.GEOLOCATION) {
                this.tryGetUserLocation();
            }

        } catch (error) {
            console.error('App initialization error:', error);
            this.showError(error.message);
        }
    }

    /**
     * Handle search button click or Enter key press
     */
    async handleSearch() {
        const city = this.cityInput.value.trim();
        
        if (!city) {
            this.showError(CONFIG.ERRORS.INVALID_INPUT);
            this.cityInput.focus();
            return;
        }

        if (this.isLoading) {
            console.log('Search already in progress');
            return;
        }

        await this.fetchWeatherData(city);
    }

    /**
     * Fetch weather data from API with caching and error handling
     * @param {string} city - City name to search for
     */
    async fetchWeatherData(city) {
        try {
            this.isLoading = true;
            this.showLoading();
            this.hideError();
            this.hideWeatherCard();

            // Check cache first
            if (CONFIG.FEATURES.CACHE) {
                const cachedData = this.getCachedData(city);
                if (cachedData) {
                    console.log('Loading from cache:', city);
                    this.displayWeatherData(cachedData);
                    this.hideLoading();
                    this.isLoading = false;
                    return;
                }
            }

            // Fetch from API
            const url = ConfigUtils.getApiUrl(city);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.APP.REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('API Response Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                
                let errorMessage;
                switch (response.status) {
                    case 404:
                        errorMessage = CONFIG.ERRORS.CITY_NOT_FOUND;
                        break;
                    case 401:
                        errorMessage = 'Invalid API key. Please check your configuration.';
                        break;
                    case 429:
                        errorMessage = CONFIG.ERRORS.RATE_LIMITED;
                        break;
                    case 500:
                    case 502:
                    case 503:
                        errorMessage = CONFIG.ERRORS.SERVER_ERROR;
                        break;
                    default:
                        errorMessage = `Weather service error (${response.status}). Please try again.`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            // Validate response data
            this.validateWeatherData(data);
            
            // Cache the data
            if (CONFIG.FEATURES.CACHE) {
                this.setCachedData(city, data);
            }

            // Save last search
            this.saveLastSearch(city);
            
            // Display the data
            this.displayWeatherData(data);
            
            console.log('Weather data fetched successfully:', data);

        } catch (error) {
            console.error('Weather fetch error:', error);
            
            if (error.name === 'AbortError') {
                this.showError(CONFIG.ERRORS.REQUEST_TIMEOUT);
            } else if (!navigator.onLine) {
                this.showError(CONFIG.ERRORS.NETWORK_ERROR);
            } else {
                this.showError(error.message || CONFIG.ERRORS.GENERIC_ERROR);
            }
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    /**
     * Validate weather data from API response
     * @param {Object} data - Weather data from API
     */
    validateWeatherData(data) {
        const required = ['name', 'main', 'weather', 'wind', 'sys'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Invalid weather data: missing ${missing.join(', ')}`);
        }

        if (!data.weather[0] || !data.weather[0].description) {
            throw new Error('Invalid weather description data');
        }
    }

    /**
     * Display weather data in the UI
     * @param {Object} data - Weather data from API
     */
    displayWeatherData(data) {
        try {
            this.currentWeatherData = data;

            // Update main weather info
            this.cityName.textContent = `${data.name}, ${data.sys.country}`;
            
            // Weather icon with error handling
            const iconCode = data.weather[0].icon;
            const iconUrl = ConfigUtils.getIconUrl(iconCode);
            this.weatherIcon.src = iconUrl;
            this.weatherIcon.alt = data.weather[0].description;
            
            // Handle icon loading errors
            this.weatherIcon.onerror = () => {
                console.warn('Weather icon failed to load:', iconUrl);
                this.weatherIcon.alt = '🌤️'; // Fallback emoji
                this.weatherIcon.style.display = 'none';
            };

            // Temperature
            const temp = Math.round(data.main.temp);
            this.temperature.textContent = `${temp}${CONFIG.UNITS.TEMPERATURE.METRIC}`;
            
            // Description
            const description = data.weather[0].description;
            this.description.textContent = this.capitalizeWords(description);
            
            // Detailed information
            this.feelsLike.textContent = `${Math.round(data.main.feels_like)}${CONFIG.UNITS.TEMPERATURE.METRIC}`;
            this.humidity.textContent = `${data.main.humidity}%`;
            this.windSpeed.textContent = `${data.wind.speed} ${CONFIG.UNITS.SPEED.METRIC}`;
            this.pressure.textContent = `${data.main.pressure} ${CONFIG.UNITS.PRESSURE.HPA}`;
            
            // Additional data with fallbacks
            if (this.visibility) {
                const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A';
                this.visibility.textContent = `${visibilityKm} km`;
            }
            
            if (this.cloudiness) {
                this.cloudiness.textContent = `${data.clouds?.all || 0}%`;
            }
            
            // Sunrise and sunset
            if (this.sunrise && data.sys.sunrise) {
                this.sunrise.textContent = ConfigUtils.formatTime(data.sys.sunrise);
            }
            
            if (this.sunset && data.sys.sunset) {
                this.sunset.textContent = ConfigUtils.formatTime(data.sys.sunset);
            }
            
            // Last updated time
            if (this.lastUpdated) {
                this.lastUpdated.textContent = new Date().toLocaleTimeString();
            }

            // Show the weather card
            this.showWeatherCard();
            
            // Update page title
            document.title = `${temp}°C - ${data.name} | Weather Dashboard`;

        } catch (error) {
            console.error('Error displaying weather data:', error);
            this.showError('Error displaying weather information');
        }
    }

    /**
     * Capitalize each word in a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Show weather card with animation
     */
    showWeatherCard() {
        this.weatherCard.classList.add('show');
    }

    /**
     * Hide weather card
     */
    hideWeatherCard() {
        this.weatherCard.classList.remove('show');
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        // Auto-hide error after specified time
        setTimeout(() => {
            this.hideError();
        }, CONFIG.UI.ERROR_DISPLAY_TIME);

        // Scroll error into view if needed
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.classList.remove('show');
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.loadingIndicator.classList.add('show');
        this.searchBtn.disabled = true;
        this.searchBtn.innerHTML = '<span class="btn-text">Loading...</span><span class="btn-icon">⏳</span>';
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.loadingIndicator.classList.remove('show');
        this.searchBtn.disabled = false;
        this.searchBtn.innerHTML = '<span class="btn-text">Search</span><span class="btn-icon">🔍</span>';
    }

    /**
     * Cache management methods
     */
    getCachedData(city) {
        if (!CONFIG.FEATURES.CACHE) return null;
        
        const cacheKey = this.getCacheKey(city);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CONFIG.APP.CACHE_DURATION) {
            return cached.data;
        }
        
        // Remove expired cache
        if (cached) {
            this.cache.delete(cacheKey);
        }
        
        return null;
    }

    setCachedData(city, data) {
        if (!CONFIG.FEATURES.CACHE) return;
        
        const cacheKey = this.getCacheKey(city);
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
    }

    getCacheKey(city) {
        return city.toLowerCase().trim();
    }

    /**
     * Local storage methods
     */
    saveLastSearch(city) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SEARCH, city);
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    getLastSearch() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SEARCH);
        } catch (error) {
            console.warn('Could not read from localStorage:', error);
            return null;
        }
    }

    /**
     * Try to get user's current location (optional feature)
     */
    tryGetUserLocation() {
        if (!navigator.geolocation || !CONFIG.FEATURES.GEOLOCATION) {
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.fetchWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.warn('Geolocation error:', error);
                // Don't show error to user as this is optional
            },
            options
        );
    }

    /**
     * Fetch weather data by coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     */
    async fetchWeatherByCoordinates(lat, lon) {
        try {
            const url = `${CONFIG.API.BASE_URL}?lat=${lat}&lon=${lon}&appid=${CONFIG.API.KEY}&units=${CONFIG.API.UNITS}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                this.cityInput.value = data.name;
                this.displayWeatherData(data);
                console.log('Location detected:', data.name);
            }
        } catch (error) {
            console.warn('Error fetching weather by coordinates:', error);
        }
    }

    /**
     * Get current weather data (for external access)
     * @returns {Object|null} Current weather data
     */
    getCurrentWeatherData() {
        return this.currentWeatherData;
    }

    /**
     * Refresh current weather data
     */
    async refreshWeather() {
        if (this.currentWeatherData) {
            const city = this.currentWeatherData.name;
            // Clear cache for this city to force fresh data
            this.cache.delete(this.getCacheKey(city));
            await this.fetchWeatherData(city);
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.weatherApp = new WeatherApp();
        console.log('Weather Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Weather Dashboard:', error);
        
        // Show basic error message if app fails to initialize
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = 'Failed to initialize weather app. Please refresh the page.';
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
});

