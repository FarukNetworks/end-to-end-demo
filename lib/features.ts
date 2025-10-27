import { env } from '@/lib/env';

/**
 * Feature flags configuration
 * Controls which features are enabled in the current environment
 */
export const features = {
  budgets: env.ENABLE_BUDGETS,
  csvExport: env.ENABLE_CSV_EXPORT,
  recurring: env.ENABLE_RECURRING,
  attachments: env.ENABLE_ATTACHMENTS,
} as const;

/**
 * Feature flag type
 */
export type Feature = keyof typeof features;

/**
 * Check if a feature is enabled
 *
 * @param feature - The feature to check
 * @returns True if the feature is enabled, false otherwise
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('budgets')) {
 *   // Show budget UI
 * }
 * ```
 */
export function isFeatureEnabled(feature: Feature): boolean {
  return features[feature];
}

/**
 * Get all enabled features
 *
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): Feature[] {
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as Feature);
}

/**
 * Check if all specified features are enabled
 *
 * @param featureList - List of features to check
 * @returns True if all features are enabled
 */
export function areAllFeaturesEnabled(featureList: Feature[]): boolean {
  return featureList.every((feature) => isFeatureEnabled(feature));
}

/**
 * Check if any of the specified features are enabled
 *
 * @param featureList - List of features to check
 * @returns True if at least one feature is enabled
 */
export function isAnyFeatureEnabled(featureList: Feature[]): boolean {
  return featureList.some((feature) => isFeatureEnabled(feature));
}
