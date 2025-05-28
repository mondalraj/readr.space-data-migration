import { AuthorService, Gender } from '../db';

/**
 * Example function demonstrating how to use the AuthorService
 */
async function authorServiceExample() {
  // Create an instance of AuthorService
  const authorService = new AuthorService();
  
  try {
    console.log('Creating a sample author...');
    const author = await authorService.create({
      olid: 'OL123456A',
      name: 'Jane Austen',
      birth_date: new Date('1775-12-16'),
      alternate_names: ['J. Austen'],
      gender: Gender.female,
      link: 'https://openlibrary.org/authors/OL21594A/Jane_Austen',
      about: 'Jane Austen was an English novelist known primarily for her six major novels...',
      rating_count: 1000,
      average_rating: 4.5,
      image_url: 'https://covers.openlibrary.org/a/olid/OL21594A-M.jpg'
    });
    console.log('Created author:', author);
    
    console.log('\nSearching for authors with "Austen" in their name...');
    const searchResults = await authorService.search({
      name: 'Austen',
      take: 5
    });
    console.log('Search results:', searchResults);
    
    console.log('\nUpdating author...');
    const updatedAuthor = await authorService.update(author.id, {
      alternate_names: [...author.alternate_names, 'Jane A.']
    });
    console.log('Updated author:', updatedAuthor);
    
    // Example of how to delete (commented out for safety)
    // console.log('\nDeleting author...');
    // const deletedAuthor = await authorService.delete(author.id);
    // console.log('Deleted author:', deletedAuthor);
    
  } catch (error) {
    console.error('Error in author service example:', error);
  } finally {
    // Clean up (e.g., close connections if needed)
    // In real application, you might want to handle this differently
    console.log('\nExample completed');
  }
}

// Run the example
// authorServiceExample().catch(console.error);

export { authorServiceExample };
