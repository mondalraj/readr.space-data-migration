// Export all models
export * from './models/author.model';

// Export all services
export { AuthorService } from './services/author.service';

// Export the Prisma client for direct database access if needed
export { prisma } from './utils/prisma-client';
