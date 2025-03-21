/**
 * Health Monitoring Service
 * Provides real-time monitoring of system health and components
 */

import deploymentUtils, { SystemHealthStatus } from "@/lib/deploymentUtils";

export interface HealthCheckOptions {
  includeMetrics?: boolean;
  detailedComponentStatus?: boolean;
}

export interface AlertConfig {
  enabled: boolean;
  cpuThreshold: number;
  memoryThreshold: number;
  diskThreshold: number;
  responseTimeThreshold: number; // in ms
  errorRateThreshold: number; // percentage
  recipients: string[];
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  message: string;
  component?: string;
  metric?: string;
  value?: number;
  threshold?: number;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  resolvedAt?: string;
}

class HealthMonitor {
  private alertConfig: AlertConfig = {
    enabled: false,
    cpuThreshold: 80,
    memoryThreshold: 80,
    diskThreshold: 85,
    responseTimeThreshold: 1000,
    errorRateThreshold: 5,
    recipients: [],
  };

  private activeAlerts: AlertNotification[] = [];
  private alertHistory: AlertNotification[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckHistory: SystemHealthStatus[] = [];

  /**
   * Initialize the health monitor with alert configuration
   */
  initialize(config: AlertConfig): void {
    this.alertConfig = config;
    console.log("Health monitoring system initialized");
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const healthStatus = await this.checkHealth();
        this.healthCheckHistory.push(healthStatus);

        // Keep only the last 100 health checks
        if (this.healthCheckHistory.length > 100) {
          this.healthCheckHistory.shift();
        }

        // Check for alert conditions
        if (this.alertConfig.enabled) {
          this.evaluateAlertConditions(healthStatus);
        }
      } catch (error) {
        console.error("Health check failed:", error);
        this.triggerAlert({
          severity: "critical",
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          component: "HealthMonitor",
        });
      }
    }, intervalMs);

    console.log(`Health monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop continuous health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("Health monitoring stopped");
    }
  }

  /**
   * Perform a health check
   */
  async checkHealth(
    options: HealthCheckOptions = {},
  ): Promise<SystemHealthStatus> {
    return deploymentUtils.checkHealth();
  }

  /**
   * Get recent health check history
   */
  getHealthHistory(limit: number = 10): SystemHealthStatus[] {
    return this.healthCheckHistory.slice(-limit);
  }

  /**
   * Evaluate alert conditions based on health status
   */
  private evaluateAlertConditions(health: SystemHealthStatus): void {
    // Check CPU usage
    if (health.metrics.cpu > this.alertConfig.cpuThreshold) {
      this.triggerAlert({
        severity: health.metrics.cpu > 90 ? "critical" : "warning",
        message: `High CPU usage detected: ${health.metrics.cpu}%`,
        metric: "cpu",
        value: health.metrics.cpu,
        threshold: this.alertConfig.cpuThreshold,
      });
    }

    // Check memory usage
    if (health.metrics.memory > this.alertConfig.memoryThreshold) {
      this.triggerAlert({
        severity: health.metrics.memory > 90 ? "critical" : "warning",
        message: `High memory usage detected: ${health.metrics.memory}%`,
        metric: "memory",
        value: health.metrics.memory,
        threshold: this.alertConfig.memoryThreshold,
      });
    }

    // Check disk usage
    if (health.metrics.disk > this.alertConfig.diskThreshold) {
      this.triggerAlert({
        severity: health.metrics.disk > 95 ? "critical" : "warning",
        message: `High disk usage detected: ${health.metrics.disk}%`,
        metric: "disk",
        value: health.metrics.disk,
        threshold: this.alertConfig.diskThreshold,
      });
    }

    // Check component status
    for (const component of health.components) {
      if (component.status === "down") {
        this.triggerAlert({
          severity: "critical",
          message: `Component is down: ${component.name}`,
          component: component.name,
        });
      } else if (component.status === "degraded") {
        this.triggerAlert({
          severity: "warning",
          message: `Component is degraded: ${component.name}${component.message ? ` - ${component.message}` : ""}`,
          component: component.name,
        });
      }
    }
  }

  /**
   * Trigger a new alert or update an existing one
   */
  private triggerAlert(alert: {
    severity: "info" | "warning" | "critical";
    message: string;
    component?: string;
    metric?: string;
    value?: number;
    threshold?: number;
  }): void {
    // Check if a similar alert is already active
    const existingAlertIndex = this.activeAlerts.findIndex(
      (a) =>
        a.component === alert.component &&
        a.metric === alert.metric &&
        a.status === "active",
    );

    if (existingAlertIndex >= 0) {
      // Update existing alert if the severity increased
      const existingAlert = this.activeAlerts[existingAlertIndex];
      if (
        (alert.severity === "critical" &&
          existingAlert.severity !== "critical") ||
        (alert.severity === "warning" && existingAlert.severity === "info")
      ) {
        this.activeAlerts[existingAlertIndex] = {
          ...existingAlert,
          severity: alert.severity,
          message: alert.message,
          value: alert.value,
          timestamp: new Date().toISOString(),
        };

        this.notifyAlert(this.activeAlerts[existingAlertIndex]);
      }
    } else {
      // Create new alert
      const newAlert: AlertNotification = {
        id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        severity: alert.severity,
        message: alert.message,
        component: alert.component,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        status: "active",
      };

      this.activeAlerts.push(newAlert);
      this.alertHistory.push(newAlert);

      // Keep alert history manageable
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }

      this.notifyAlert(newAlert);
    }
  }

  /**
   * Send alert notification to configured recipients
   */
  private notifyAlert(alert: AlertNotification): void {
    if (!this.alertConfig.enabled || this.alertConfig.recipients.length === 0) {
      return;
    }

    // In a real implementation, this would send emails, Slack messages, etc.
    console.log(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
    console.log(`Would notify: ${this.alertConfig.recipients.join(", ")}`);
  }

  /**
   * Acknowledge an active alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alertIndex = this.activeAlerts.findIndex((a) => a.id === alertId);
    if (alertIndex >= 0) {
      this.activeAlerts[alertIndex] = {
        ...this.activeAlerts[alertIndex],
        status: "acknowledged",
        acknowledgedBy,
      };

      // Update in history as well
      const historyIndex = this.alertHistory.findIndex((a) => a.id === alertId);
      if (historyIndex >= 0) {
        this.alertHistory[historyIndex] = this.activeAlerts[alertIndex];
      }

      return true;
    }
    return false;
  }

  /**
   * Resolve an active alert
   */
  resolveAlert(alertId: string): boolean {
    const alertIndex = this.activeAlerts.findIndex((a) => a.id === alertId);
    if (alertIndex >= 0) {
      const resolvedAlert = {
        ...this.activeAlerts[alertIndex],
        status: "resolved",
        resolvedAt: new Date().toISOString(),
      };

      // Remove from active alerts
      this.activeAlerts.splice(alertIndex, 1);

      // Update in history
      const historyIndex = this.alertHistory.findIndex((a) => a.id === alertId);
      if (historyIndex >= 0) {
        this.alertHistory[historyIndex] = resolvedAlert;
      }

      return true;
    }
    return false;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): AlertNotification[] {
    return [...this.activeAlerts];
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): AlertNotification[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): AlertConfig {
    this.alertConfig = {
      ...this.alertConfig,
      ...config,
    };
    return this.alertConfig;
  }

  /**
   * Get current alert configuration
   */
  getAlertConfig(): AlertConfig {
    return { ...this.alertConfig };
  }
}

// Create a singleton instance
const healthMonitor = new HealthMonitor();
export default healthMonitor;
