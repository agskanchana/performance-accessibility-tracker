# PageSpeed Sitemap Analyzer

This application analyzes all URLs from a website's sitemap using Google PageSpeed Insights API and generates a CSV report with performance and accessibility scores.

## Features

- Fetches and parses XML sitemaps
- Analyzes each URL using Google PageSpeed Insights API
- Supports both mobile and desktop analysis
- Generates CSV reports with performance metrics
- Includes error handling and rate limiting
- Provides analysis URLs for detailed PageSpeed reports

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a Google PageSpeed Insights API key:**
   - Visit: https://developers.google.com/speed/docs/insights/v5/get-started
   - Create a project and enable the PageSpeed Insights API
   - Generate an API key

3. **Configure environment variables:**
   - Copy `.env` file and add your API key:
   ```
   PAGESPEED_API_KEY=your_actual_api_key_here
   ```

## Usage

### Basic usage with default sitemap:
```bash
npm start
```

### Analyze a specific sitemap:
```bash
node index.js https://your-website.com/sitemap.xml
```

### Examples:
```bash
# Analyze dental crafters sitemap
node index.js https://www.dentalcrafters.ca/page-sitemap.xml

# Analyze another sitemap
node index.js https://example.com/sitemap.xml
```

## Output

The application generates a CSV file named `pagespeed-report-YYYY-MM-DD.csv` with the following columns:

- **URL**: The analyzed page URL
- **Device**: mobile or desktop
- **Performance Score**: Performance score (0-100)
- **Accessibility Score**: Accessibility score (0-100)
- **Best Practices Score**: Best practices score (0-100)
- **SEO Score**: SEO score (0-100)
- **PageSpeed Analysis URL**: Direct link to detailed PageSpeed report
- **Error**: Any error messages if analysis failed

## Sample Output

```
URL,Device,Performance Score,Accessibility Score,Best Practices Score,SEO Score,PageSpeed Analysis URL
https://www.dentalcrafters.ca/,mobile,85,96,92,100,https://pagespeed.web.dev/analysis/...
https://www.dentalcrafters.ca/,desktop,92,96,92,100,https://pagespeed.web.dev/analysis/...
https://www.dentalcrafters.ca/about/,mobile,78,94,89,100,https://pagespeed.web.dev/analysis/...
```

## Rate Limiting

The application includes a 1-second delay between API calls to respect Google's rate limits. For large sitemaps, the analysis may take some time.

## Error Handling

- If a URL fails to analyze, it will be marked with "Error" and continue with the next URL
- Network errors and API errors are logged but don't stop the entire process
- Invalid sitemaps will cause the application to exit with an error message

## Troubleshooting

1. **API Key Issues**: Make sure your API key is correctly set in the `.env` file
2. **Rate Limiting**: If you get rate limit errors, increase the delay in `index.js`
3. **Large Sitemaps**: For very large sitemaps, consider analyzing in batches

## API Costs

Google PageSpeed Insights API has usage quotas:
- 25,000 queries per day (free tier)
- Each URL analysis counts as one query per device type

Monitor your usage in the Google Cloud Console.
