const puppeteer = require('puppeteer');
const fs = require('fs');

async function measurePerformance() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const metrics = {
    timestamp: new Date().toISOString(),
    pages: {},
    apiCalls: {},
    resources: {}
  };

  // Helper function to measure page metrics
  async function measurePage(url, pageName) {
    console.log(`Measuring ${pageName}...`);
    
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.performanceMarks = [];
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const startTime = performance.now();
        return originalFetch.apply(this, args).then(response => {
          const endTime = performance.now();
          window.performanceMarks.push({
            type: 'api',
            url: args[0],
            duration: endTime - startTime,
            status: response.status
          });
          return response;
        });
      };
    });

    // Collect network requests
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: Date.now()
      });
    });

    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTime = Date.now() - startTime;

    // Get performance metrics
    const perfMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        responseTime: perfData.responseEnd - perfData.requestStart,
        fetchStart: perfData.fetchStart,
        connectTime: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart, // Time to First Byte
        apiCalls: window.performanceMarks || []
      };
    });

    // Get resource timing
    const resourceTimings = await page.evaluate(() => 
      performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize || 0,
        type: r.initiatorType
      }))
    );

    // Calculate totals
    const jsSize = resourceTimings
      .filter(r => r.type === 'script')
      .reduce((sum, r) => sum + r.size, 0);
    
    const cssSize = resourceTimings
      .filter(r => r.type === 'link' || r.name.includes('.css'))
      .reduce((sum, r) => sum + r.size, 0);
    
    const imageSize = resourceTimings
      .filter(r => r.type === 'img' || r.type === 'image')
      .reduce((sum, r) => sum + r.size, 0);

    // Clear listeners
    page.removeAllListeners('request');
    page.removeAllListeners('response');

    return {
      url,
      loadTime,
      metrics: perfMetrics,
      resourceCount: resourceTimings.length,
      totalRequests: requests.length,
      sizes: {
        javascript: jsSize,
        css: cssSize,
        images: imageSize,
        total: jsSize + cssSize + imageSize
      },
      resources: resourceTimings.slice(0, 10) // Top 10 resources
    };
  }

  // Measure each page in the funnel
  metrics.pages.claim = await measurePage('http://localhost:3000/claim', 'Claim Page');
  
  // Simulate email claim flow
  console.log('Testing email claim flow...');
  await page.goto('http://localhost:3000/emailclaim', { waitUntil: 'networkidle2' });
  
  // Fill and submit email form
  await page.waitForSelector('input[type="email"]', { timeout: 5000 }).catch(() => {});
  const emailFieldExists = await page.$('input[type="email"]');
  
  if (emailFieldExists) {
    await page.type('input[type="email"]', 'test@example.com');
    
    // Measure API call
    const apiStartTime = Date.now();
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    ]);
    metrics.apiCalls.emailClaim = {
      duration: Date.now() - apiStartTime,
      endpoint: '/api/emailclaim'
    };
  }
  
  metrics.pages.emailclaim = await measurePage('http://localhost:3000/emailclaim', 'Email Claim Page');
  metrics.pages.track = await measurePage('http://localhost:3000/track', 'Track Page');

  // Get build size info
  console.log('Analyzing build size...');
  const buildAnalysis = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      scriptCount: scripts.length,
      styleCount: styles.length,
      scripts: scripts.map(s => s.src),
      styles: styles.map(s => s.href)
    };
  });
  
  metrics.buildAnalysis = buildAnalysis;

  await browser.close();

  // Generate report
  const report = generateReport(metrics);
  
  // Save raw metrics
  fs.writeFileSync('performance-baseline.json', JSON.stringify(metrics, null, 2));
  
  // Save readable report
  fs.writeFileSync('performance-baseline-report.md', report);
  
  console.log('\n' + report);
  console.log('\nMetrics saved to performance-baseline.json and performance-baseline-report.md');
}

function generateReport(metrics) {
  const report = `# Performance Baseline Report
Generated: ${metrics.timestamp}

## 🎯 Funnel Flow Performance (/claim → /emailclaim → /track)

### Page Load Times
| Page | Load Time | TTFB | DOM Interactive | Resources |
|------|-----------|------|-----------------|-----------|
| /claim | ${metrics.pages.claim.loadTime}ms | ${Math.round(metrics.pages.claim.metrics.ttfb)}ms | ${Math.round(metrics.pages.claim.metrics.domInteractive)}ms | ${metrics.pages.claim.resourceCount} |
| /emailclaim | ${metrics.pages.emailclaim.loadTime}ms | ${Math.round(metrics.pages.emailclaim.metrics.ttfb)}ms | ${Math.round(metrics.pages.emailclaim.metrics.domInteractive)}ms | ${metrics.pages.emailclaim.resourceCount} |
| /track | ${metrics.pages.track.loadTime}ms | ${Math.round(metrics.pages.track.metrics.ttfb)}ms | ${Math.round(metrics.pages.track.metrics.domInteractive)}ms | ${metrics.pages.track.resourceCount} |

### Bundle Sizes
| Page | JavaScript | CSS | Images | Total |
|------|------------|-----|--------|-------|
| /claim | ${formatBytes(metrics.pages.claim.sizes.javascript)} | ${formatBytes(metrics.pages.claim.sizes.css)} | ${formatBytes(metrics.pages.claim.sizes.images)} | ${formatBytes(metrics.pages.claim.sizes.total)} |
| /emailclaim | ${formatBytes(metrics.pages.emailclaim.sizes.javascript)} | ${formatBytes(metrics.pages.emailclaim.sizes.css)} | ${formatBytes(metrics.pages.emailclaim.sizes.images)} | ${formatBytes(metrics.pages.emailclaim.sizes.total)} |
| /track | ${formatBytes(metrics.pages.track.sizes.javascript)} | ${formatBytes(metrics.pages.track.sizes.css)} | ${formatBytes(metrics.pages.track.sizes.images)} | ${formatBytes(metrics.pages.track.sizes.total)} |

### API Performance
| Endpoint | Response Time |
|----------|---------------|
| /api/emailclaim | ${metrics.apiCalls.emailClaim ? metrics.apiCalls.emailClaim.duration + 'ms' : 'N/A'} |

### Top Resource Load Times - /claim
${metrics.pages.claim.resources.slice(0, 5).map(r => 
  `- ${r.name.split('/').pop()}: ${Math.round(r.duration)}ms (${formatBytes(r.size)})`
).join('\n')}

### Top Resource Load Times - /track
${metrics.pages.track.resources.slice(0, 5).map(r => 
  `- ${r.name.split('/').pop()}: ${Math.round(r.duration)}ms (${formatBytes(r.size)})`
).join('\n')}

## 📊 Key Metrics Summary
- **Average Page Load Time**: ${Math.round((metrics.pages.claim.loadTime + metrics.pages.emailclaim.loadTime + metrics.pages.track.loadTime) / 3)}ms
- **Total Bundle Size (avg)**: ${formatBytes((metrics.pages.claim.sizes.total + metrics.pages.emailclaim.sizes.total + metrics.pages.track.sizes.total) / 3)}
- **Average TTFB**: ${Math.round((metrics.pages.claim.metrics.ttfb + metrics.pages.emailclaim.metrics.ttfb + metrics.pages.track.metrics.ttfb) / 3)}ms
- **Total Resources Loaded (avg)**: ${Math.round((metrics.pages.claim.resourceCount + metrics.pages.emailclaim.resourceCount + metrics.pages.track.resourceCount) / 3)}

## 🎯 Performance Targets for Optimization
Based on current metrics, suggested targets for improvement:
- Reduce average page load time to < 1000ms (from ${Math.round((metrics.pages.claim.loadTime + metrics.pages.emailclaim.loadTime + metrics.pages.track.loadTime) / 3)}ms)
- Reduce JavaScript bundle size by 30%
- Improve TTFB to < 200ms
- Implement code splitting to reduce initial bundle size
- Add resource hints (preconnect, prefetch) for critical resources
`;

  return report;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Run the measurement
measurePerformance().catch(console.error);