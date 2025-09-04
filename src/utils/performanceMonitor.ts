// Performance monitoring utility for SEO optimization

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fmp: number | null;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fmp: null
  };

  constructor() {
    this.initObservers();
    this.measureTTFB();
  }

  private initObservers() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
            this.logMetric('FCP', fcpEntry.startTime);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observer failed:', e);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.lcp = lastEntry.startTime;
            this.logMetric('LCP', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              this.metrics.fid = fid;
              this.logMetric('FID', fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer failed:', e);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.logMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }
    }
  }

  private measureTTFB() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.logMetric('TTFB', this.metrics.ttfb);
      }
    }
  }

  private logMetric(name: string, value: number) {
    const status = this.getMetricStatus(name, value);
    console.log(`🚀 ${name}: ${value.toFixed(2)}ms - ${status}`);
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true
      });
    }
  }

  private getMetricStatus(name: string, value: number): string {
    const thresholds: { [key: string]: { good: number; needsImprovement: number } } = {
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      TTFB: { good: 800, needsImprovement: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'Unknown';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.needsImprovement) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getLighthouseScore(): number {
    let score = 100;
    const metrics = this.getMetrics();

    // FCP scoring
    if (metrics.fcp && metrics.fcp > 1800) {
      score -= 10;
    }

    // LCP scoring
    if (metrics.lcp && metrics.lcp > 2500) {
      score -= 15;
    }

    // FID scoring
    if (metrics.fid && metrics.fid > 100) {
      score -= 10;
    }

    // CLS scoring
    if (metrics.cls && metrics.cls > 0.1) {
      score -= 15;
    }

    // TTFB scoring
    if (metrics.ttfb && metrics.ttfb > 800) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getLighthouseScore();
    
    return `
Performance Report:
==================
Lighthouse Score: ${score}/100
FCP: ${metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A'}
LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A'}
FID: ${metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A'}
CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
TTFB: ${metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A'}
    `.trim();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export const usePerformanceMonitor = () => {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getLighthouseScore: () => performanceMonitor.getLighthouseScore(),
    generateReport: () => performanceMonitor.generateReport()
  };
};
