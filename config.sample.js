// SAMPLE Configuration file for PageSpeed Analyzer
// Copy this file to config.js and add your actual API key

const CONFIG = {
    PAGESPEED_API_KEY: 'your_api_key_here'
};

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
