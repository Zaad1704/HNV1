import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor component mount time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${componentName} - ${entry.name}: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Measure render time
    const measureRender = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performance.mark(`${componentName}-render-end`);
      performance.measure(
        `${componentName}-render-time`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
      
      // Log performance metrics
      const metrics: PerformanceMetrics = {
        loadTime: renderTime,
        renderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };
      
      // Send to analytics (replace with your analytics service)
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('component_performance', {
        //   component: componentName,
        //   ...metrics
        // });
      }
    };
    
    performance.mark(`${componentName}-render-start`);
    
    // Measure after component is fully rendered
    const timeoutId = setTimeout(measureRender, 0);
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [componentName]);
  
  // Web Vitals monitoring
  useEffect(() => {
    if ('web-vital' in window) {
      // Monitor Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);
};