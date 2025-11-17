import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(65535))
    .default('3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  CORS_ORIGIN: z.string().optional(),
});

/**
 * Validate and parse environment variables
 * @throws {Error} If required environment variables are missing or invalid
 */
export const validateEnv = () => {
  console.log('env', process.env);
  try {
    const env = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    });

    // Set validated values back to process.env
    process.env.NODE_ENV = env.NODE_ENV;
    process.env.PORT = String(env.PORT);
    process.env.MONGODB_URI = env.MONGODB_URI;
    process.env.JWT_SECRET = env.JWT_SECRET;
    if (env.CORS_ORIGIN) {
      process.env.CORS_ORIGIN = env.CORS_ORIGIN;
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `Environment variable validation failed:\n${missingVars}\n\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw error;
  }
};

export default validateEnv;

