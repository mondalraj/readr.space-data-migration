import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma-client';
import { Author, CreateAuthorInput, UpdateAuthorInput, AuthorSearchParams } from '../models/author.model';

/**
 * AuthorService - Handles all database operations for the Author model
 */
export class AuthorService {
  /**
   * Create a new author in the database
   * @param data The author data to create
   * @returns The created author
   */
  async create(data: CreateAuthorInput): Promise<Author> {
    return prisma.author.create({
      data,
    });
  }

  /**
   * Create multiple authors in the database in a single transaction
   * @param data Array of author data to create
   * @returns The created authors
   */
  async createMany(data: CreateAuthorInput[]): Promise<Prisma.BatchPayload> {
    return prisma.author.createMany({
      data,
      skipDuplicates: true, // Skip records that conflict with existing ones
    });
  }

  /**
   * Get a single author by ID
   * @param id The author ID
   * @returns The found author or null
   */
  async getById(id: number): Promise<Author | null> {
    return prisma.author.findUnique({
      where: { id },
    });
  }

  /**
   * Get a single author by OLID (Open Library ID)
   * @param olid The Open Library ID
   * @returns The found author or null
   */
  async getByOlid(olid: string): Promise<Author | null> {
    return prisma.author.findFirst({
      where: { olid },
    });
  }

  /**
   * Get a single author by UUID
   * @param uuid The author UUID
   * @returns The found author or null
   */
  async getByUuid(uuid: string): Promise<Author | null> {
    return prisma.author.findUnique({
      where: { uuid },
    });
  }

  /**
   * Get all authors with pagination
   * @param skip Number of records to skip (for pagination)
   * @param take Number of records to take (for pagination)
   * @returns Array of authors
   */
  async getAll(skip = 0, take = 50): Promise<Author[]> {
    return prisma.author.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update an author by ID
   * @param id The author ID
   * @param data The data to update
   * @returns The updated author
   */
  async update(id: number, data: UpdateAuthorInput): Promise<Author> {
    return prisma.author.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an author by ID
   * @param id The author ID
   * @returns The deleted author
   */
  async delete(id: number): Promise<Author> {
    return prisma.author.delete({
      where: { id },
    });
  }

  /**
   * Search for authors based on various criteria
   * @param params Search parameters
   * @returns Array of matching authors
   */
  async search(params: AuthorSearchParams): Promise<Author[]> {
    const { name, alternate_names, about, take = 50, skip = 0 } = params;
    
    // Build the query conditions
    const where: Prisma.AuthorWhereInput = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // Case-insensitive search
      };
    }
    
    if (alternate_names) {
      where.alternate_names = {
        has: alternate_names,
      };
    }
    
    if (about) {
      where.about = {
        contains: about,
        mode: 'insensitive', // Case-insensitive search
      };
    }
    
    return prisma.author.findMany({
      where,
      take,
      skip,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Count authors matching the search criteria
   * @param params Search parameters
   * @returns Number of matching authors
   */
  async count(params: Partial<AuthorSearchParams>): Promise<number> {
    const { name, alternate_names, about } = params;
    
    // Build the query conditions
    const where: Prisma.AuthorWhereInput = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    
    if (alternate_names) {
      where.alternate_names = {
        has: alternate_names,
      };
    }
    
    if (about) {
      where.about = {
        contains: about,
        mode: 'insensitive',
      };
    }
    
    return prisma.author.count({ where });
  }
}
