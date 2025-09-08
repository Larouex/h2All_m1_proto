# Performance Baseline Report
Generated: 2025-09-08T22:37:49.821Z

## 🎯 Funnel Flow Performance (/claim → /emailclaim → /track)

### Page Load Times
| Page | Load Time | TTFB | DOM Interactive | Resources |
|------|-----------|------|-----------------|-----------|
| /claim | 2690ms | 1050ms | 1068ms | 8 |
| /emailclaim | 1095ms | 47ms | 56ms | 7 |
| /track | 1074ms | 21ms | 26ms | 7 |

### Bundle Sizes
| Page | JavaScript | CSS | Images | Total |
|------|------------|-----|--------|-------|
| /claim | 3.26 MB | 68.74 KB | 0 B | 3.33 MB |
| /emailclaim | 3.26 MB | 21.15 KB | 0 B | 3.28 MB |
| /track | 3.26 MB | 21.15 KB | 0 B | 3.28 MB |

### API Performance
| Endpoint | Response Time |
|----------|---------------|
| /api/emailclaim | N/A |

### Top Resource Load Times - /claim
- webpack.js: 13ms (10.6 KB)
- app-pages-internals.js: 20ms (41.01 KB)
- main-app.js: 287ms (1.86 MB)
- e4af272ccee01ff0-s.p.woff2: 6ms (47.59 KB)
- layout.css?v=1757371070800: 7ms (10.55 KB)

### Top Resource Load Times - /track
- webpack.js: 4ms (10.6 KB)
- app-pages-internals.js: 7ms (41.01 KB)
- main-app.js: 199ms (1.86 MB)
- e4af272ccee01ff0-s.p.woff2: 0ms (0 B)
- layout.css?v=1757371079358: 2ms (10.55 KB)

## 📊 Key Metrics Summary
- **Average Page Load Time**: 1620ms
- **Total Bundle Size (avg)**: 3.3 MB
- **Average TTFB**: 372ms
- **Total Resources Loaded (avg)**: 7

## 🎯 Performance Targets for Optimization
Based on current metrics, suggested targets for improvement:
- Reduce average page load time to < 1000ms (from 1620ms)
- Reduce JavaScript bundle size by 30%
- Improve TTFB to < 200ms
- Implement code splitting to reduce initial bundle size
- Add resource hints (preconnect, prefetch) for critical resources
