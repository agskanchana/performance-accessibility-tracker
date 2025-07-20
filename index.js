const axios = require('axios');
const xml2js = require('xml2js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
require('dotenv').config();

class PageSpeedAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
        this.delay = 1000; // 1 second delay between API calls to avoid rate limiting
    }

    // Fetch and parse sitemap XML
    async fetchSitemap(sitemapUrl) {
        try {
            console.log(`Fetching sitemap: ${sitemapUrl}`);
            const response = await axios.get(sitemapUrl);
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(response.data);

            // Extract URLs from sitemap
            const urls = [];
            if (result.urlset && result.urlset.url) {
                result.urlset.url.forEach(urlObj => {
                    if (urlObj.loc && urlObj.loc[0]) {
                        urls.push(urlObj.loc[0]);
                    }
                });
            }

            console.log(`Found ${urls.length} URLs in sitemap`);
            return urls;
        } catch (error) {
            console.error('Error fetching sitemap:', error.message);
            throw error;
        }
    }

    // Get PageSpeed Insights data for a single URL
    async getPageSpeedData(url, strategy = 'mobile') {
        try {
            const apiUrl = `${this.baseUrl}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${this.apiKey}`;

            console.log(`Analyzing: ${url} (${strategy})`);
            const response = await axios.get(apiUrl);

            const data = response.data;
            const lighthouseResult = data.lighthouseResult;

            if (!lighthouseResult || !lighthouseResult.categories) {
                throw new Error('Invalid PageSpeed Insights response');
            }

            return {
                url: url,
                strategy: strategy,
                performanceScore: Math.round((lighthouseResult.categories.performance?.score || 0) * 100),
                accessibilityScore: Math.round((lighthouseResult.categories.accessibility?.score || 0) * 100),
                bestPracticesScore: Math.round((lighthouseResult.categories['best-practices']?.score || 0) * 100),
                seoScore: Math.round((lighthouseResult.categories.seo?.score || 0) * 100),
                analysisUrl: `https://pagespeed.web.dev/analysis/${encodeURIComponent(url)}/${data.id}?form_factor=${strategy}`
            };
        } catch (error) {
            console.error(`Error analyzing ${url}:`, error.message);
            return {
                url: url,
                strategy: strategy,
                performanceScore: 'Error',
                accessibilityScore: 'Error',
                bestPracticesScore: 'Error',
                seoScore: 'Error',
                analysisUrl: 'Error',
                error: error.message
            };
        }
    }

    // Add delay between API calls
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Analyze all URLs in sitemap
    async analyzeSitemap(sitemapUrl, strategies = ['mobile', 'desktop']) {
        try {
            const urls = await this.fetchSitemap(sitemapUrl);
            const results = [];

            for (const url of urls) {
                for (const strategy of strategies) {
                    const result = await this.getPageSpeedData(url, strategy);
                    results.push(result);

                    // Add delay to avoid rate limiting
                    await this.sleep(this.delay);
                }
            }

            return results;
        } catch (error) {
            console.error('Error analyzing sitemap:', error.message);
            throw error;
        }
    }

    // Generate CSV report
    async generateCSVReport(results, filename = 'pagespeed-report.csv') {
        const csvWriter = createCsvWriter({
            path: filename,
            header: [
                { id: 'url', title: 'URL' },
                { id: 'strategy', title: 'Device' },
                { id: 'performanceScore', title: 'Performance Score' },
                { id: 'accessibilityScore', title: 'Accessibility Score' },
                { id: 'bestPracticesScore', title: 'Best Practices Score' },
                { id: 'seoScore', title: 'SEO Score' },
                { id: 'analysisUrl', title: 'PageSpeed Analysis URL' },
                { id: 'error', title: 'Error' }
            ]
        });

        await csvWriter.writeRecords(results);
        console.log(`CSV report generated: ${filename}`);
    }
}

// Main execution function
async function main() {
    // Check if API key is provided
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
        console.error('Please set PAGESPEED_API_KEY environment variable');
        console.log('You can get an API key from: https://developers.google.com/speed/docs/insights/v5/get-started');
        process.exit(1);
    }

    // Configuration
    const sitemapUrl = process.argv[2] || 'https://www.dentalcrafters.ca/page-sitemap.xml';
    const strategies = ['mobile', 'desktop']; // Analyze both mobile and desktop

    console.log(`Starting PageSpeed analysis for: ${sitemapUrl}`);
    console.log(`Analyzing strategies: ${strategies.join(', ')}`);

    const analyzer = new PageSpeedAnalyzer(apiKey);

    try {
        // Analyze sitemap
        const results = await analyzer.analyzeSitemap(sitemapUrl, strategies);

        // Generate CSV report
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `pagespeed-report-${timestamp}.csv`;
        await analyzer.generateCSVReport(results, filename);

        // Display summary
        const successfulAnalyses = results.filter(r => r.performanceScore !== 'Error');
        const errorAnalyses = results.filter(r => r.performanceScore === 'Error');

        console.log('\n--- Analysis Summary ---');
        console.log(`Total URLs analyzed: ${results.length}`);
        console.log(`Successful analyses: ${successfulAnalyses.length}`);
        console.log(`Failed analyses: ${errorAnalyses.length}`);

        if (successfulAnalyses.length > 0) {
            const avgPerformance = Math.round(
                successfulAnalyses.reduce((sum, r) => sum + parseInt(r.performanceScore), 0) / successfulAnalyses.length
            );
            const avgAccessibility = Math.round(
                successfulAnalyses.reduce((sum, r) => sum + parseInt(r.accessibilityScore), 0) / successfulAnalyses.length
            );

            console.log(`Average Performance Score: ${avgPerformance}`);
            console.log(`Average Accessibility Score: ${avgAccessibility}`);
        }

        console.log(`\nReport saved as: ${filename}`);

    } catch (error) {
        console.error('Analysis failed:', error.message);
        process.exit(1);
    }
}

// Run the application
if (require.main === module) {
    main();
}

module.exports = PageSpeedAnalyzer;
