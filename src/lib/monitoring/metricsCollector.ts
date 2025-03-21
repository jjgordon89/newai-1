/**
 * Metrics Collector
 * Collects and aggregates system and application metrics
 */

import deploymentUtils from "@/lib/deploymentUtils";

export interface MetricsConfig {
  enabled: boolean;
  collectionInterval: number; // in milliseconds
  retentionPeriod: number; // in hours
  exportEnabled: boolean;
  exportEndpoint?: string;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface MetricSeries {
  name: string;
  points: MetricPoint[];
  unit: string;
  description: string;
}

export interface ApplicationMetrics {
  cpu: MetricSeries;
  memory: MetricSeries;
  disk: MetricSeries;
  activeConnections: MetricSeries;
  requestsPerMinute: MetricSeries;
  responseTime: MetricSeries;
  errorRate: MetricSeries;
  successfulRequests: MetricSeries;
  failedRequests: MetricSeries;
}

class MetricsCollector {
  private config: MetricsConfig = {
    enabled: false,
    collectionInterval: 60000, // 1 minute
    retentionPeriod: 24, // 24 hours
    exportEnabled: false,
  };

  private collectionInterval: NodeJS.Timeout | null = null;
  private metrics: ApplicationMetrics;
  private customMetrics: Map<string, MetricSeries> = new Map();

  constructor() {
    // Initialize empty metric series
    this.metrics = {
      cpu: this.createMetricSeries("cpu", "percentage", "CPU usage percentage"),
      memory: this.createMetricSeries(
        "memory",
        "percentage",
        "Memory usage percentage",
      ),
      disk: this.createMetricSeries(
        "disk",
        "percentage",
        "Disk usage percentage",
      ),
      activeConnections: this.createMetricSeries(
        "active_connections",
        "count",
        "Number of active connections",
      ),
      requestsPerMinute: this.createMetricSeries(
        "requests_per_minute",
        "count/min",
        "Request rate per minute",
      ),
      responseTime: this.createMetricSeries(
        "response_time",
        "ms",
        "Average response time in milliseconds",
      ),
      errorRate: this.createMetricSeries(
        "error_rate",
        "percentage",
        "Percentage of failed requests",
      ),
      successfulRequests: this.createMetricSeries(
        "successful_requests",
        "count",
        "Count of successful requests",
      ),
      failedRequests: this.createMetricSeries(
        "failed_requests",
        "count",
        "Count of failed requests",
      ),
    };
  }

  /**
   * Initialize metrics collector with configuration
   */
  initialize(config: MetricsConfig): void {
    this.config = config;
    console.log("Metrics collector initialized");
  }

  /**
   * Start collecting metrics at the configured interval
   */
  startCollection(): void {
    if (!this.config.enabled) {
      console.log("Metrics collection is disabled");
      return;
    }

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        this.pruneOldMetrics();

        if (this.config.exportEnabled && this.config.exportEndpoint) {
          this.exportMetrics();
        }
      } catch (error) {
        console.error("Error collecting metrics:", error);
      }
    }, this.config.collectionInterval);

    console.log(
      `Metrics collection started with ${this.config.collectionInterval}ms interval`,
    );
  }

  /**
   * Stop collecting metrics
   */
  stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
      console.log("Metrics collection stopped");
    }
  }

  /**
   * Collect current system metrics
   */
  async collectMetrics(): Promise<void> {
    try {
      // Get system health which includes metrics
      const healthStatus = await deploymentUtils.checkHealth();
      const timestamp = new Date().toISOString();

      // Add new data points to each metric series
      this.addMetricPoint("cpu", timestamp, healthStatus.metrics.cpu);
      this.addMetricPoint("memory", timestamp, healthStatus.metrics.memory);
      this.addMetricPoint("disk", timestamp, healthStatus.metrics.disk);
      this.addMetricPoint(
        "activeConnections",
        timestamp,
        healthStatus.metrics.activeConnections,
      );
      this.addMetricPoint(
        "requestsPerMinute",
        timestamp,
        healthStatus.metrics.requestsPerMinute,
      );

      // These would come from actual application monitoring in a real implementation
      // Here we're generating mock values
      this.addMetricPoint(
        "responseTime",
        timestamp,
        Math.floor(Math.random() * 200) + 50,
      ); // 50-250ms
      this.addMetricPoint("errorRate", timestamp, Math.random() * 5); // 0-5%
      this.addMetricPoint(
        "successfulRequests",
        timestamp,
        healthStatus.metrics.requestsPerMinute * 0.95,
      ); // 95% success rate
      this.addMetricPoint(
        "failedRequests",
        timestamp,
        healthStatus.metrics.requestsPerMinute * 0.05,
      ); // 5% failure rate
    } catch (error) {
      console.error("Failed to collect metrics:", error);
      throw error;
    }
  }

  /**
   * Add a data point to a metric series
   */
  private addMetricPoint(
    metricName: keyof ApplicationMetrics,
    timestamp: string,
    value: number,
  ): void {
    this.metrics[metricName].points.push({ timestamp, value });
  }

  /**
   * Create a new metric series
   */
  private createMetricSeries(
    name: string,
    unit: string,
    description: string,
  ): MetricSeries {
    return {
      name,
      points: [],
      unit,
      description,
    };
  }

  /**
   * Remove metrics older than the retention period
   */
  private pruneOldMetrics(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.config.retentionPeriod);
    const cutoffTimestamp = cutoffTime.toISOString();

    // Prune each metric series
    Object.keys(this.metrics).forEach((key) => {
      const metricName = key as keyof ApplicationMetrics;
      this.metrics[metricName].points = this.metrics[metricName].points.filter(
        (point) => point.timestamp >= cutoffTimestamp,
      );
    });

    // Prune custom metrics
    this.customMetrics.forEach((metric, name) => {
      metric.points = metric.points.filter(
        (point) => point.timestamp >= cutoffTimestamp,
      );
    });
  }

  /**
   * Export metrics to configured endpoint
   */
  private async exportMetrics(): Promise<void> {
    if (!this.config.exportEnabled || !this.config.exportEndpoint) {
      return;
    }

    try {
      // In a real implementation, this would send metrics to a monitoring system
      // like Prometheus, Datadog, etc.
      console.log(`Exporting metrics to ${this.config.exportEndpoint}`);

      // Mock export - in a real app, this would be an API call
      // await fetch(this.config.exportEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.getLatestMetrics()),
      // });
    } catch (error) {
      console.error("Failed to export metrics:", error);
    }
  }

  /**
   * Register a custom metric
   */
  registerCustomMetric(name: string, unit: string, description: string): void {
    if (!this.customMetrics.has(name)) {
      this.customMetrics.set(
        name,
        this.createMetricSeries(name, unit, description),
      );
    }
  }

  /**
   * Record a value for a custom metric
   */
  recordCustomMetric(name: string, value: number): void {
    if (!this.customMetrics.has(name)) {
      throw new Error(`Custom metric '${name}' not registered`);
    }

    const metric = this.customMetrics.get(name)!;
    metric.points.push({
      timestamp: new Date().toISOString(),
      value,
    });
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): {
    system: ApplicationMetrics;
    custom: Map<string, MetricSeries>;
  } {
    return {
      system: this.metrics,
      custom: this.customMetrics,
    };
  }

  /**
   * Get latest metrics as a simple object
   */
  getLatestMetrics(): Record<string, number> {
    const result: Record<string, number> = {};

    // Get latest value for each system metric
    Object.keys(this.metrics).forEach((key) => {
      const metricName = key as keyof ApplicationMetrics;
      const points = this.metrics[metricName].points;
      if (points.length > 0) {
        result[metricName] = points[points.length - 1].value;
      }
    });

    // Get latest value for each custom metric
    this.customMetrics.forEach((metric, name) => {
      const points = metric.points;
      if (points.length > 0) {
        result[name] = points[points.length - 1].value;
      }
    });

    return result;
  }

  /**
   * Get metric data for a specific time range
   */
  getMetricData(
    metricName: string,
    startTime: Date,
    endTime: Date = new Date(),
  ): MetricPoint[] {
    const startTimestamp = startTime.toISOString();
    const endTimestamp = endTime.toISOString();

    // Check if it's a system metric
    if (metricName in this.metrics) {
      const metric = this.metrics[metricName as keyof ApplicationMetrics];
      return metric.points.filter(
        (point) =>
          point.timestamp >= startTimestamp && point.timestamp <= endTimestamp,
      );
    }

    // Check if it's a custom metric
    if (this.customMetrics.has(metricName)) {
      const metric = this.customMetrics.get(metricName)!;
      return metric.points.filter(
        (point) =>
          point.timestamp >= startTimestamp && point.timestamp <= endTimestamp,
      );
    }

    throw new Error(`Metric '${metricName}' not found`);
  }

  /**
   * Update metrics configuration
   */
  updateConfig(config: Partial<MetricsConfig>): MetricsConfig {
    const wasEnabled = this.config.enabled;
    const newInterval =
      config.collectionInterval !== undefined &&
      config.collectionInterval !== this.config.collectionInterval;

    this.config = {
      ...this.config,
      ...config,
    };

    // Restart collection if enabled status or interval changed
    if (this.config.enabled && (!wasEnabled || newInterval)) {
      this.stopCollection();
      this.startCollection();
    } else if (!this.config.enabled && wasEnabled) {
      this.stopCollection();
    }

    return this.config;
  }

  /**
   * Get current metrics configuration
   */
  getConfig(): MetricsConfig {
    return { ...this.config };
  }
}

// Create a singleton instance
const metricsCollector = new MetricsCollector();
export default metricsCollector;
