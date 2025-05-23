/**
 * Gets an environment variable and validates it exists
 * @param key The environment variable key
 * @param defaultValue Optional default value if not required
 * @returns The environment variable value
 * @throws Error if the required environment variable is missing
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required, check file: ${getEnvFilePath()}`);
  }

  return value;
}

/**
 * Gets a numeric environment variable and validates it exists
 * @param key The environment variable key
 * @param defaultValue Optional default numeric value if not required
 * @returns The environment variable value as a number
 * @throws Error if the required environment variable is missing or not a valid number
 */
export function getEnvNumeric(key: string, defaultValue?: number): number {
  const stringValue = getEnv(key, defaultValue?.toString());

  const numericValue = Number(stringValue);

  if (isNaN(numericValue)) {
    throw new Error(
      `Environment variable ${key} must be a valid number, got ${stringValue}, check file: ${getEnvFilePath()}`,
    );
  }

  return numericValue;
}

/**
 * Gets the environment file path based on the current NODE_ENV
 */
export function getEnvFilePath(): string {
  return `envs/.${process.env.NODE_ENV ?? 'dev'}.env`;
}
