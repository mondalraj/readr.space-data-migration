import { Author as PrismaAuthor, Gender } from '@prisma/client';

// Re-export Prisma generated types for consistency
export { Gender };
export type Author = PrismaAuthor;

// Input type for creating a new author
export interface CreateAuthorInput {
  olid: string;
  birth_date?: Date | null;
  alternate_names: string[];
  name: string;
  link: string;
  rating_count?: number;
  average_rating?: number;
  gender: Gender;
  image_url?: string;
  about: string;
}

// Input type for updating an existing author
export interface UpdateAuthorInput {
  birth_date?: Date | null;
  alternate_names?: string[];
  name?: string;
  link?: string;
  rating_count?: number;
  average_rating?: number;
  gender?: Gender;
  image_url?: string;
  about?: string;
}

// Author search parameters
export interface AuthorSearchParams {
  name?: string;
  alternate_names?: string;
  about?: string;
  take?: number;
  skip?: number;
}
