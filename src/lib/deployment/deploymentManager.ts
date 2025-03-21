/**
 * Deployment Manager
 * Manages application deployments across different environments
 */

import deploymentUtils, { DeploymentConfig } from "@/lib/deploymentUtils";
import healthMonitor from "@/lib/monitoring/healthMonitor";
import metricsCollector from "@/lib/monitoring/metricsCollector";

export interface DeploymentEnvironment {
  name: string;
  url: string;
  status: "active" | "inactive" | "deploying" | "failed";
  version: string;
  lastDeployedAt?: string;
  deployedBy?: string;
  config: DeploymentConfig;
}

export interface DeploymentHistory {
  id: string;
  environment: string;
  version: string;
  timestamp: string;
  status: "success" | "failed" | "rolled-back";
  deployedBy: string;
  rollbackTo?: string;
  notes?: string;
}

export interface DeploymentOptions {
  skipTests?: boolean;
  forceDeploy?: boolean;
  notifyOnComplete?: boolean;
  notes?: string;
}

class DeploymentManager {
  private environments: DeploymentEnvironment[] = [];
  private deploymentHistory: DeploymentHistory[] = [];
  private currentEnvironment: string | null = null;

  /**
   * Initialize the deployment manager
   */
  initialize(environments: DeploymentEnvironment[]): void {
    this.environments = environments;
    console.log(
      `Deployment manager initialized with ${environments.length} environments`,
    );
  }

  /**
   * Set the current active environment
   */
  setCurrentEnvironment(environmentName: string): void {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    this.currentEnvironment = environmentName;
    deploymentUtils.initialize(environment.config);

    // Initialize monitoring for this environment
    healthMonitor.initialize({
      enabled: environment.config.monitoring.alertingEnabled,
      cpuThreshold: environment.config.scaling.cpuThreshold,
      memoryThreshold: environment.config.scaling.memoryThreshold,
      diskThreshold: 85, // Default disk threshold
      responseTimeThreshold: 1000, // Default response time threshold (1 second)
      errorRateThreshold: 5, // Default error rate threshold (5%)
      recipients: ["devops@example.com"], // Default alert recipients
    });

    metricsCollector.initialize({
      enabled: environment.config.monitoring.metricsEnabled,
      collectionInterval: 60000, // 1 minute
      retentionPeriod: 24, // 24 hours
      exportEnabled: false,
    });

    if (environment.config.monitoring.metricsEnabled) {
      metricsCollector.startCollection();
    }

    if (environment.config.monitoring.alertingEnabled) {
      healthMonitor.startMonitoring();
    }

    console.log(`Current environment set to ${environmentName}`);
  }

  /**
   * Get all environments
   */
  getEnvironments(): DeploymentEnvironment[] {
    return [...this.environments];
  }

  /**
   * Get a specific environment
   */
  getEnvironment(name: string): DeploymentEnvironment | undefined {
    return this.environments.find((env) => env.name === name);
  }

  /**
   * Get the current environment
   */
  getCurrentEnvironment(): DeploymentEnvironment | null {
    if (!this.currentEnvironment) return null;
    return this.getEnvironment(this.currentEnvironment) || null;
  }

  /**
   * Deploy to an environment
   */
  async deploy(
    environmentName: string,
    version: string,
    deployedBy: string,
    options: DeploymentOptions = {},
  ): Promise<DeploymentHistory> {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    // Update environment status
    environment.status = "deploying";

    try {
      // Simulate deployment process
      console.log(`Deploying version ${version} to ${environmentName}...`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate 5 seconds deployment

      // Update environment details
      environment.version = version;
      environment.lastDeployedAt = new Date().toISOString();
      environment.deployedBy = deployedBy;
      environment.status = "active";

      // Create deployment history entry
      const deploymentRecord: DeploymentHistory = {
        id: `deploy-${Date.now()}`,
        environment: environmentName,
        version,
        timestamp: new Date().toISOString(),
        status: "success",
        deployedBy,
        notes: options.notes,
      };

      this.deploymentHistory.push(deploymentRecord);
      return deploymentRecord;
    } catch (error) {
      // Update environment status on failure
      environment.status = "failed";

      // Create failed deployment history entry
      const failedDeployment: DeploymentHistory = {
        id: `deploy-${Date.now()}`,
        environment: environmentName,
        version,
        timestamp: new Date().toISOString(),
        status: "failed",
        deployedBy,
        notes: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      };

      this.deploymentHistory.push(failedDeployment);
      throw error;
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollback(
    environmentName: string,
    targetVersion: string,
    deployedBy: string,
    notes?: string,
  ): Promise<DeploymentHistory> {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    // Find the deployment history for the target version
    const targetDeployment = this.deploymentHistory.find(
      (deploy) =>
        deploy.environment === environmentName &&
        deploy.version === targetVersion &&
        deploy.status === "success",
    );

    if (!targetDeployment) {
      throw new Error(
        `No successful deployment found for version ${targetVersion} in ${environmentName}`,
      );
    }

    // Update environment status
    environment.status = "deploying";

    try {
      // Simulate rollback process
      console.log(
        `Rolling back ${environmentName} to version ${targetVersion}...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate 3 seconds rollback

      // Update environment details
      const currentVersion = environment.version;
      environment.version = targetVersion;
      environment.lastDeployedAt = new Date().toISOString();
      environment.deployedBy = deployedBy;
      environment.status = "active";

      // Create rollback deployment history entry
      const rollbackRecord: DeploymentHistory = {
        id: `rollback-${Date.now()}`,
        environment: environmentName,
        version: targetVersion,
        timestamp: new Date().toISOString(),
        status: "success",
        deployedBy,
        rollbackTo: currentVersion,
        notes:
          notes || `Rolled back from ${currentVersion} to ${targetVersion}`,
      };

      this.deploymentHistory.push(rollbackRecord);
      return rollbackRecord;
    } catch (error) {
      // Update environment status on failure
      environment.status = "failed";

      // Create failed rollback history entry
      const failedRollback: DeploymentHistory = {
        id: `rollback-${Date.now()}`,
        environment: environmentName,
        version: targetVersion,
        timestamp: new Date().toISOString(),
        status: "failed",
        deployedBy,
        rollbackTo: environment.version,
        notes: `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      };

      this.deploymentHistory.push(failedRollback);
      throw error;
    }
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(
    environmentName?: string,
    limit: number = 10,
  ): DeploymentHistory[] {
    let history = [...this.deploymentHistory];

    if (environmentName) {
      history = history.filter(
        (deploy) => deploy.environment === environmentName,
      );
    }

    // Sort by timestamp (newest first) and limit
    return history
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Generate deployment documentation
   */
  generateDeploymentDocs(environmentName: string): string {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    // Set the environment as current to initialize deployment utils
    this.setCurrentEnvironment(environmentName);

    // Generate documentation
    return deploymentUtils.generateDeploymentDocs();
  }

  /**
   * Generate Kubernetes manifest for an environment
   */
  generateK8sManifest(environmentName: string): Record<string, any> {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    // Set the environment as current to initialize deployment utils
    this.setCurrentEnvironment(environmentName);

    // Generate Kubernetes manifest
    return deploymentUtils.generateK8sManifest();
  }

  /**
   * Update environment configuration
   */
  updateEnvironmentConfig(
    environmentName: string,
    configUpdates: Partial<DeploymentConfig>,
  ): DeploymentEnvironment {
    const environment = this.environments.find(
      (env) => env.name === environmentName,
    );
    if (!environment) {
      throw new Error(`Environment '${environmentName}' not found`);
    }

    // Update environment configuration
    environment.config = {
      ...environment.config,
      ...configUpdates,
    };

    // If this is the current environment, update deployment utils
    if (this.currentEnvironment === environmentName) {
      deploymentUtils.updateConfig(configUpdates);

      // Update monitoring configuration if needed
      if (configUpdates.monitoring) {
        if (configUpdates.monitoring.alertingEnabled !== undefined) {
          healthMonitor.updateAlertConfig({
            enabled: configUpdates.monitoring.alertingEnabled,
          });

          if (configUpdates.monitoring.alertingEnabled) {
            healthMonitor.startMonitoring();
          } else {
            healthMonitor.stopMonitoring();
          }
        }

        if (configUpdates.monitoring.metricsEnabled !== undefined) {
          metricsCollector.updateConfig({
            enabled: configUpdates.monitoring.metricsEnabled,
          });

          if (configUpdates.monitoring.metricsEnabled) {
            metricsCollector.startCollection();
          } else {
            metricsCollector.stopCollection();
          }
        }
      }
    }

    return environment;
  }

  /**
   * Create a new environment
   */
  createEnvironment(environment: DeploymentEnvironment): DeploymentEnvironment {
    // Check if environment with the same name already exists
    if (this.environments.some((env) => env.name === environment.name)) {
      throw new Error(`Environment '${environment.name}' already exists`);
    }

    this.environments.push(environment);
    return environment;
  }
}

// Create a singleton instance
const deploymentManager = new DeploymentManager();
export default deploymentManager;
