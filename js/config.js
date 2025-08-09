// API Configuration
const CONFIG = {
    // OpenWeatherMap API Configuration
    API: {
        KEY: API_KEY, // Your API key from api_key.js
        BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
        ICON_BASE_URL: 'https://openweathermap.org/img/wn',
        UNITS: 'metric', // 'metric' for Celsius, 'imperial' for Fahrenheit
        LANGUAGE: 'en' // Language code for weather descriptions
    },

    // Application Settings
    APP: {
        DEFAULT_CITY: 'London', // Default city to load on startup
        SEARCH_DELAY: 300, // Debounce delay for search input (ms)
        CACHE_DURATION: 10 * 60 * 1000, // Cache duration in milliseconds (10 minutes)
        REQUEST_TIMEOUT: 8000, // API request timeout in milliseconds
        RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
        RETRY_DELAY: 1000 // Delay between retry attempts (ms)
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300, // Animation duration in milliseconds
        DEBOUNCE_DELAY: 500, // Debounce delay for user input
        ERROR_DISPLAY_TIME: 5000, // How long to show error messages (ms)
        SUCCESS_MESSAGE_TIME: 3000 // How long to show success messages (ms)
    },

    // Weather data mapping for better user experience
    WEATHER_CONDITIONS: {
        // Mapping weather condition codes to more user-friendly descriptions
        200: 'Thunderstorm with light rain',
        201: 'Thunderstorm with rain',
        202: 'Thunderstorm with heavy rain',
        210: 'Light thunderstorm',
        211: 'Thunderstorm',
        212: 'Heavy thunderstorm',
        221: 'Ragged thunderstorm',
        230: 'Thunderstorm with light drizzle',
        231: 'Thunderstorm with drizzle',
        232: 'Thunderstorm with heavy drizzle',
        300: 'Light intensity drizzle',
        301: 'Drizzle',
        302: 'Heavy intensity drizzle',
        310: 'Light intensity drizzle rain',
        311: 'Drizzle rain',
        312: 'Heavy intensity drizzle rain',
        313: 'Shower rain and drizzle',
        314: 'Heavy shower rain and drizzle',
        321: 'Shower drizzle',
        500: 'Light rain',
        501: 'Moderate rain',
        502: 'Heavy intensity rain',
        503: 'Very heavy rain',
        504: 'Extreme rain',
        511: 'Freezing rain',
        520: 'Light intensity shower rain',
        521: 'Shower rain',
        522: 'Heavy intensity shower rain',
        531: 'Ragged shower rain',
        600: 'Light snow',
        601: 'Snow',
        602: 'Heavy snow',
        611: 'Sleet',
        612: 'Light shower sleet',
        613: 'Shower sleet',
        615: 'Light rain and snow',
        616: 'Rain and snow',
        620: 'Light shower snow',
        621: 'Shower snow',
        622: 'Heavy shower snow',
        701: 'Mist',
        711: 'Smoke',
        721: 'Haze',
        731: 'Sand/dust whirls',
        741: 'Fog',
        751: 'Sand',
        761: 'Dust',
        762: 'Volcanic ash',
        771: 'Squalls',
        781: 'Tornado',
        800: 'Clear sky',
        801: 'Few clouds',
        802: 'Scattered clouds',
        803: 'Broken clouds',
        804: 'Overcast clouds'
    },

    // Units and conversions
    UNITS: {
        TEMPERATURE: {
            METRIC: '°C',
            IMPERIAL: '°F',
            KELVIN: 'K'
        },
        SPEED: {
            METRIC: 'm/s',
            IMPERIAL: 'mph',
            KMH: 'km/h'
        },
        PRESSURE: {
            HPA: 'hPa',
            INHG: 'inHg',
            MMHG: 'mmHg'
        },
        DISTANCE: {
            METRIC: 'km',
            IMPERIAL: 'mi'
        }
    },

    // Error messages
    ERRORS: {
        API_KEY_MISSING: 'API key is missing. Please check your configuration.',
        CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        SERVER_ERROR: 'Weather service is temporarily unavailable. Please try again later.',
        INVALID_INPUT: 'Please enter a valid city name.',
        REQUEST_TIMEOUT: 'Request timed out. Please try again.',
        RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
        GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
        GEOLOCATION_DENIED: 'Location access denied. Please enter a city manually.',
        GEOLOCATION_UNAVAILABLE: 'Location service unavailable. Please enter a city manually.',
        GEOLOCATION_TIMEOUT: 'Location request timed out. Please enter a city manually.'
    },

    // Success messages
    MESSAGES: {
        WEATHER_LOADED: 'Weather data loaded successfully!',
        LOCATION_DETECTED: 'Location detected automatically!',
        CACHE_LOADED: 'Loaded from cache for faster performance!'
    },

    // Local storage keys
    STORAGE_KEYS: {
        LAST_SEARCH: 'weatherApp_lastSearch',
        CACHE_PREFIX: 'weatherApp_cache_',
        SETTINGS: 'weatherApp_settings',
        FAVORITES: 'weatherApp_favorites'
    },

    // Feature flags
    FEATURES: {
        GEOLOCATION: true, // Enable geolocation detection
        CACHE: true, // Enable data caching
        OFFLINE_MODE: false, // Enable offline mode (future feature)
        DARK_MODE: false, // Enable dark mode toggle (future feature)
        UNIT_TOGGLE: true, // Enable unit conversion toggle
        FAVORITES: false // Enable favorite cities (future feature)
    }
};

// Utility functions for configuration
const ConfigUtils = {
    /**
     * Get API URL with parameters
     * @param {string} city - City name
     * @returns {string} Complete API URL
     */
    getApiUrl(city) {
        // Ensure city name is properly encoded for URL
        const encodedCity = encodeURIComponent(city.trim());
        const params = new URLSearchParams({
            q: encodedCity,
            appid: CONFIG.API.KEY,
            units: CONFIG.API.UNITS,
            lang: CONFIG.API.LANGUAGE
        });
        const url = `${CONFIG.API.BASE_URL}?${params.toString()}`;
        console.log('API URL:', url); // Debug: log the actual URL being requested
        return url;
    },

    /**
     * Check if API key is valid (non-empty string)
     * @returns {boolean} True if API key is valid
     */
    isValidApiKey() {
        return typeof CONFIG.API.KEY === 'string' && CONFIG.API.KEY.trim().length > 0;
    },

    /**
     * Get weather icon URL
     * @param {string} iconCode - Icon code from API
     * @param {string} size - Icon size ('2x' for 100x100px, '4x' for 200x200px)
     * @returns {string} Complete icon URL
     */
    getIconUrl(iconCode, size = '2x') {
        return `${CONFIG.API.ICON_BASE_URL}/${iconCode}@${size}.png`;
    },

    /**
     * Get user-friendly weather description
     * @param {number} conditionCode - Weather condition code from API
     * @param {string} fallback - Fallback description if code not found
     * @returns {string} User-friendly weather description
     */
    getWeatherDescription(conditionCode, fallback = 'Unknown weather condition') {
        return CONFIG.WEATHER_CONDITIONS[conditionCode] || fallback;
    },

    /**
     * Get cache key for a city
     * @param {string} city - City name
     * @returns {string} Cache key
     */
    getCacheKey(city) {
        return `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${city.toLowerCase().replace(/\s+/g, '_')}`;
    },

    /**
     * Check if cache is still valid
     * @param {number} timestamp - Cached data timestamp
     * @returns {boolean} True if cache is still valid
     */
    isCacheValid(timestamp) {
        return (Date.now() - timestamp) < CONFIG.APP.CACHE_DURATION;
    },

    /**
     * Convert temperature between units
     * @param {number} temp - Temperature value
     * @param {string} from - Source unit ('celsius', 'fahrenheit', 'kelvin')
     * @param {string} to - Target unit ('celsius', 'fahrenheit', 'kelvin')
     * @returns {number} Converted temperature
     */
    convertTemperature(temp, from, to) {
        if (from === to) return temp;
        
        // Convert to Celsius first
        let celsius = temp;
        if (from === 'fahrenheit') {
            celsius = (temp - 32) * 5/9;
        } else if (from === 'kelvin') {
            celsius = temp - 273.15;
        }
        
        // Convert from Celsius to target unit
        if (to === 'fahrenheit') {
            return (celsius * 9/5) + 32;
        } else if (to === 'kelvin') {
            return celsius + 273.15;
        }
        
        return celsius;
    },

    /**
     * Convert wind speed between units
     * @param {number} speed - Wind speed value
     * @param {string} from - Source unit ('ms', 'mph', 'kmh')
     * @param {string} to - Target unit ('ms', 'mph', 'kmh')
     * @returns {number} Converted wind speed
     */
    convertWindSpeed(speed, from, to) {
        if (from === to) return speed;
        
        // Convert to m/s first
        let ms = speed;
        if (from === 'mph') {
            ms = speed * 0.44704;
        } else if (from === 'kmh') {
            ms = speed / 3.6;
        }
        
        // Convert from m/s to target unit
        if (to === 'mph') {
            return ms / 0.44704;
        } else if (to === 'kmh') {
            return ms * 3.6;
        }
        
        return ms;
    },

    /**
     * Format temperature with unit symbol
     * @param {number} temp - Temperature value
     * @param {string} unit - Unit type ('metric', 'imperial')
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted temperature string
     */
    formatTemperature(temp, unit = CONFIG.API.UNITS, decimals = 0) {
        const symbol = unit === 'metric' ? CONFIG.UNITS.TEMPERATURE.METRIC : CONFIG.UNITS.TEMPERATURE.IMPERIAL;
        return `${temp.toFixed(decimals)}${symbol}`;
    },

    /**
     * Format wind speed with unit symbol
     * @param {number} speed - Wind speed value
     * @param {string} unit - Unit type ('metric', 'imperial')
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted wind speed string
     */
    formatWindSpeed(speed, unit = CONFIG.API.UNITS, decimals = 1) {
        const symbol = unit === 'metric' ? CONFIG.UNITS.SPEED.METRIC : CONFIG.UNITS.SPEED.IMPERIAL;
        return `${speed.toFixed(decimals)} ${symbol}`;
    },

    /**
     * Format pressure with unit symbol
     * @param {number} pressure - Pressure value in hPa
     * @param {string} unit - Unit type ('hpa', 'inhg', 'mmhg')
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted pressure string
     */
    formatPressure(pressure, unit = 'hpa', decimals = 0) {
        let convertedPressure = pressure;
        let symbol = CONFIG.UNITS.PRESSURE.HPA;
        
        if (unit === 'inhg') {
            convertedPressure = pressure * 0.02953;
            symbol = CONFIG.UNITS.PRESSURE.INHG;
            decimals = 2;
        } else if (unit === 'mmhg') {
            convertedPressure = pressure * 0.75006;
            symbol = CONFIG.UNITS.PRESSURE.MMHG;
        }
        
        return `${convertedPressure.toFixed(decimals)} ${symbol}`;
    },

    /**
     * Format Unix timestamp to readable time string
     * @param {number} timestamp - Unix timestamp (seconds)
     * @returns {string} Formatted time string (HH:MM AM/PM)
     */
    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    /**
     * Validate city name input
     * @param {string} city - City name to validate
     * @returns {boolean} True if valid city name
     */
    isValidCityName(city) {
        if (!city || typeof city !== 'string') return false;
        const trimmed = city.trim();
        return trimmed.length > 0 && trimmed.length <= 100 && /^[a-zA-Z\s\-',.\u00C0-\u017F]+$/.test(trimmed);
    },

    /**
     * Get error message by type
     * @param {string} errorType - Error type key
     * @param {string} fallback - Fallback message if error type not found
     * @returns {string} Error message
     */
    getErrorMessage(errorType, fallback = CONFIG.ERRORS.GENERIC_ERROR) {
        return CONFIG.ERRORS[errorType] || fallback;
    },

    /**
     * Check if feature is enabled
     * @param {string} featureName - Feature name
     * @returns {boolean} True if feature is enabled
     */
    isFeatureEnabled(featureName) {
        return CONFIG.FEATURES[featureName] === true;
    },

    /**
     * Get configuration value by path
     * @param {string} path - Dot-separated path (e.g., 'API.KEY', 'APP.DEFAULT_CITY')
     * @returns {any} Configuration value
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    },

    /**
     * Deep clone configuration object (for safe modification)
     * @returns {object} Cloned configuration object
     */
    clone() {
        return JSON.parse(JSON.stringify(CONFIG));
    }
};
