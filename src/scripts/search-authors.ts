import { AuthorService, AuthorSearchParams } from '../db';

/**
 * Search for authors in the database based on provided criteria
 */
async function searchAuthors(
  params: AuthorSearchParams,
  limit: number = 10
): Promise<void> {
  console.log(`Searching for authors with criteria:`, params);
  
  const authorService = new AuthorService();
  
  try {
    // Ensure limit is applied
    params.take = limit;
    
    // Execute search
    const authors = await authorService.search(params);
    
    // Get total count with the same parameters (but without pagination)
    const { take, skip, ...countParams } = params;
    const totalCount = await authorService.count(countParams);
    
    console.log(`Found ${authors.length} authors of ${totalCount} total matches`);
    
    if (authors.length === 0) {
      console.log('No authors found matching your search criteria.');
      return;
    }
    
    // Display results
    console.log('\nSearch Results:');
    console.log('==============================================================');
    authors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.name}`);
      if (author.birth_date) {
        console.log(`   Birth Date: ${author.birth_date.toLocaleDateString()}`);
      }
      if (author.alternate_names && author.alternate_names.length > 0) {
        console.log(`   Also known as: ${author.alternate_names.join(', ')}`);
      }
      console.log(`   Open Library ID: ${author.olid}`);
      if (author.about) {
        // Show truncated biography
        const shortBio = author.about.length > 100 
          ? author.about.substring(0, 100) + '...' 
          : author.about;
        console.log(`   Bio: ${shortBio}`);
      }
      console.log('--------------------------------------------------------------');
    });
    
    console.log(`\nShowing ${authors.length} of ${totalCount} matching authors.`);
    
  } catch (error) {
    console.error('Error searching for authors:', error);
  }
}

if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  // Extract search parameters
  const searchParams: AuthorSearchParams = {};
  let limit = 10;
  
  // Process arguments in format: --param value
  for (let i = 0; i < args.length; i += 2) {
    const param = args[i].replace(/^--/, '');
    const value = args[i + 1];
    
    switch (param) {
      case 'name':
        searchParams.name = value;
        break;
      case 'alternate_name':
        searchParams.alternate_names = value;
        break;
      case 'about':
        searchParams.about = value;
        break;
      case 'limit':
        limit = parseInt(value, 10) || 10;
        break;
      case 'skip':
        searchParams.skip = parseInt(value, 10) || 0;
        break;
      default:
        console.warn(`Unknown parameter: ${param}`);
    }
  }
  
  // Execute search
  searchAuthors(searchParams, limit)
    .then(() => {
      console.log('Search completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during search:', error);
      process.exit(1);
    });
}

export { searchAuthors };
