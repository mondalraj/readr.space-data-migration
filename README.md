# READR Data Migration

This project is designed to handle data migration and database operations for the READR application, with support for processing large author data files and managing PostgreSQL database operations.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` (if not already done)
   - Update the `DATABASE_URL` to point to your PostgreSQL database

4. Run database migrations:
   ```
   npm run prisma:migrate
   ```

## Database Schema

The main entity in the database is the `Author` model, which represents authors from the Open Library dataset.

### Author Schema

The Author model includes:
- `id`: Auto-incremented ID
- `olid`: Open Library ID (unique)
- `birth_date`: Author's birth date
- `alternate_names`: Array of alternate names
- `name`: Primary author name
- `link`: URL to the author's page
- `rating_count`: Number of ratings
- `average_rating`: Average rating score
- `gender`: Gender (enum: male, female, others)
- `image_url`: URL to author's image
- `about`: Biographical information
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp
- `uuid`: Unique UUID

## Available Scripts

- `npm run build`: Build the TypeScript project
- `npm run dev`: Run the application in development mode
- `npm start [operation]`: Run a specific operation:
  - `process-file`: Process the authors file without database import
  - `author-example`: Run the author service example
  - `import-authors`: Import authors from file to database
  - `search-authors`: Search for authors in the database

### Database Management

- `npm run prisma:studio`: Open Prisma Studio to manage database data
- `npm run prisma:migrate`: Run Prisma migrations
- `npm run prisma:reset`: Reset the database (Warning: deletes all data)

## Example Usage

### Process a large authors file
```
npm start process-file path/to/authors.txt 10000
```

### Import authors into the database
```
npm start import-authors path/to/authors.txt 100
```

### Search for authors in the database
```
npm start search-authors --name "Jane Austen" --limit 5
```
or
```
npm run search-authors -- --name "Tolkien" --limit 10
```

### Run author service examples
```
npm start author-example
```

## Performance Considerations

- The application is designed to handle large files (several GB) by processing data in batches
- Memory usage is optimized by streaming the file content rather than loading it entirely
- Database operations are batched for better performance

## Indexing

The database schema includes indexes on the following fields to optimize search operations:
- `name`: For searching by author name
- `alternate_names`: For searching by alternate names
- `about`: For searching by biographical information

## Development

To contribute to this project:

1. Make changes to the TypeScript files in the `src` directory
2. Run `npm run build` to compile
3. Test your changes with the appropriate script
