#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Tracks and reports performance improvements after optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      database: {
        queryTimes: [],
        cacheHitRate: 0,
        totalQueries: 0,
        cachedQueries: 0
      },
      frontend: {
        pageLoadTimes: [],
        imageLoadTimes: [],
        memoryUsage: [],
        bundleSize: 0
      },
      overall: {
        startTime: Date.now(),
        improvements: []
      }
    };
    
    this.reportPath = path.join(__dirname, '../performance-report.json');
  }

  // Track database query performance
  trackQuery(queryName, startTime) {
    const duration = Date.now() - startTime;
    this.metrics.database.queryTimes.push({
      query: queryName,
      duration,
      timestamp: Date.now()
    });
    this.metrics.database.totalQueries++;
  }

  // Track cache performance
  trackCacheHit(isHit) {
    if (isHit) {
      this.metrics.database.cachedQueries++;
    }
    this.metrics.database.cacheHitRate = 
      (this.metrics.database.cachedQueries / this.metrics.database.totalQueries) * 100;
  }

  // Track page load performance
  trackPageLoad(pageName, loadTime) {
    this.metrics.frontend.pageLoadTimes.push({
      page: pageName,
      loadTime,
      timestamp: Date.now()
    });
  }

  // Track image load performance
  trackImageLoad(imagePath, loadTime) {
    this.metrics.frontend.imageLoadTimes.push({
      image: imagePath,
      loadTime,
      timestamp: Date.now()
    });
  }

  // Track memory usage
  trackMemoryUsage(used, total) {
    this.metrics.frontend.memoryUsage.push({
      used,
      total,
      percentage: (used / total) * 100,
      timestamp: Date.now()
    });
  }

  // Calculate average query time
  getAverageQueryTime() {
    if (this.metrics.database.queryTimes.length === 0) return 0;
    const total = this.metrics.database.queryTimes.reduce((sum, query) => sum + query.duration, 0);
    return total / this.metrics.database.queryTimes.length;
  }

  // Calculate average page load time
  getAveragePageLoadTime() {
    if (this.metrics.frontend.pageLoadTimes.length === 0) return 0;
    const total = this.metrics.frontend.pageLoadTimes.reduce((sum, page) => sum + page.loadTime, 0);
    return total / this.metrics.frontend.pageLoadTimes.length;
  }

  // Calculate average image load time
  getAverageImageLoadTime() {
    if (this.metrics.frontend.imageLoadTimes.length === 0) return 0;
    const total = this.metrics.frontend.imageLoadTimes.reduce((sum, image) => sum + image.loadTime, 0);
    return total / this.metrics.frontend.imageLoadTimes.length;
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalQueries: this.metrics.database.totalQueries,
        cacheHitRate: this.metrics.database.cacheHitRate.toFixed(2) + '%',
        averageQueryTime: this.getAverageQueryTime().toFixed(2) + 'ms',
        averagePageLoadTime: this.getAveragePageLoadTime().toFixed(2) + 'ms',
        averageImageLoadTime: this.getAverageImageLoadTime().toFixed(2) + 'ms',
        totalPagesTracked: this.metrics.frontend.pageLoadTimes.length,
        totalImagesTracked: this.metrics.frontend.imageLoadTimes.length
      },
      details: {
        database: {
          queryTimes: this.metrics.database.queryTimes.slice(-10), // Last 10 queries
          cacheHitRate: this.metrics.database.cacheHitRate,
          totalQueries: this.metrics.database.totalQueries,
          cachedQueries: this.metrics.database.cachedQueries
        },
        frontend: {
          pageLoadTimes: this.metrics.frontend.pageLoadTimes.slice(-10), // Last 10 pages
          imageLoadTimes: this.metrics.frontend.imageLoadTimes.slice(-10), // Last 10 images
          memoryUsage: this.metrics.frontend.memoryUsage.slice(-5) // Last 5 measurements
        }
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    const avgQueryTime = this.getAverageQueryTime();
    const avgPageLoadTime = this.getAveragePageLoadTime();
    const avgImageLoadTime = this.getAverageImageLoadTime();
    const cacheHitRate = this.metrics.database.cacheHitRate;

    if (avgQueryTime > 200) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: 'Average query time is high. Consider adding database indexes or optimizing queries.',
        current: avgQueryTime.toFixed(2) + 'ms',
        target: '< 100ms'
      });
    }

    if (avgPageLoadTime > 3000) {
      recommendations.push({
        type: 'frontend',
        priority: 'high',
        message: 'Page load time is slow. Consider implementing lazy loading and code splitting.',
        current: avgPageLoadTime.toFixed(2) + 'ms',
        target: '< 2000ms'
      });
    }

    if (avgImageLoadTime > 1000) {
      recommendations.push({
        type: 'images',
        priority: 'medium',
        message: 'Image load time is slow. Consider implementing progressive image loading.',
        current: avgImageLoadTime.toFixed(2) + 'ms',
        target: '< 500ms'
      });
    }

    if (cacheHitRate < 70) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: 'Cache hit rate is low. Consider expanding cache coverage.',
        current: cacheHitRate.toFixed(2) + '%',
        target: '> 80%'
      });
    }

    return recommendations;
  }

  // Save report to file
  saveReport() {
    const report = this.generateReport();
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    console.log(`Performance report saved to: ${this.reportPath}`);
  }

  // Load previous report for comparison
  loadPreviousReport() {
    try {
      if (fs.existsSync(this.reportPath)) {
        const data = fs.readFileSync(this.reportPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load previous report:', error.message);
    }
    return null;
  }

  // Compare with previous report
  compareWithPrevious() {
    const previous = this.loadPreviousReport();
    if (!previous) {
      console.log('No previous report found for comparison.');
      return;
    }

    const current = this.generateReport();
    const improvements = [];

    // Compare query times
    const prevAvgQuery = parseFloat(previous.summary.averageQueryTime);
    const currAvgQuery = parseFloat(current.summary.averageQueryTime);
    if (currAvgQuery < prevAvgQuery) {
      improvements.push({
        metric: 'Database Query Time',
        improvement: ((prevAvgQuery - currAvgQuery) / prevAvgQuery * 100).toFixed(2) + '%',
        before: previous.summary.averageQueryTime,
        after: current.summary.averageQueryTime
      });
    }

    // Compare page load times
    const prevAvgPage = parseFloat(previous.summary.averagePageLoadTime);
    const currAvgPage = parseFloat(current.summary.averagePageLoadTime);
    if (currAvgPage < prevAvgPage) {
      improvements.push({
        metric: 'Page Load Time',
        improvement: ((prevAvgPage - currAvgPage) / prevAvgPage * 100).toFixed(2) + '%',
        before: previous.summary.averagePageLoadTime,
        after: current.summary.averagePageLoadTime
      });
    }

    // Compare cache hit rates
    const prevCacheHit = parseFloat(previous.summary.cacheHitRate);
    const currCacheHit = parseFloat(current.summary.cacheHitRate);
    if (currCacheHit > prevCacheHit) {
      improvements.push({
        metric: 'Cache Hit Rate',
        improvement: ((currCacheHit - prevCacheHit) / prevCacheHit * 100).toFixed(2) + '%',
        before: previous.summary.cacheHitRate,
        after: current.summary.cacheHitRate
      });
    }

    if (improvements.length > 0) {
      console.log('\n🎉 Performance Improvements:');
      improvements.forEach(imp => {
        console.log(`  ${imp.metric}: ${imp.improvement} improvement`);
        console.log(`    Before: ${imp.before} → After: ${imp.after}`);
      });
    } else {
      console.log('\n📊 No significant improvements detected. Consider additional optimizations.');
    }
  }

  // Print current metrics
  printMetrics() {
    const report = this.generateReport();
    console.log('\n📊 Current Performance Metrics:');
    console.log(`  Database Queries: ${report.summary.totalQueries}`);
    console.log(`  Cache Hit Rate: ${report.summary.cacheHitRate}`);
    console.log(`  Avg Query Time: ${report.summary.averageQueryTime}`);
    console.log(`  Avg Page Load: ${report.summary.averagePageLoadTime}`);
    console.log(`  Avg Image Load: ${report.summary.averageImageLoadTime}`);
    console.log(`  Pages Tracked: ${report.summary.totalPagesTracked}`);
    console.log(`  Images Tracked: ${report.summary.totalImagesTracked}`);
  }
}

// Export for use in other scripts
export default PerformanceMonitor;

// If run directly, create a demo
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  
  // Simulate some metrics
  monitor.trackQuery('get_activities', Date.now() - 150);
  monitor.trackQuery('get_events', Date.now() - 200);
  monitor.trackCacheHit(true);
  monitor.trackCacheHit(false);
  monitor.trackCacheHit(true);
  
  monitor.trackPageLoad('home', 2500);
  monitor.trackPageLoad('activities', 1800);
  monitor.trackPageLoad('events', 2200);
  
  monitor.trackImageLoad('/images/hero.jpg', 800);
  monitor.trackImageLoad('/images/gallery1.jpg', 600);
  
  monitor.trackMemoryUsage(50 * 1024 * 1024, 100 * 1024 * 1024);
  
  monitor.printMetrics();
  monitor.saveReport();
  monitor.compareWithPrevious();
} 