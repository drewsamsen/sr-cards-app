// Export configuration
export * from './config';

// Export client
export * from './client';

// Export services
export * from './services';

// Re-export commonly used types and services for convenience
import { authService } from './services';

export { authService }; 