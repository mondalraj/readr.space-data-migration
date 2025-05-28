import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { AuthorService, Gender, CreateAuthorInput } from '../db';
import { formatBytes, getMemoryUsage } from '../utils/memory-utils';

/**
 * Import authors from a tab-separated file into the database
 */
async function importAuthors(filePath: string, batchSize: number = 100): Promise<void> {
  const startTime = Date.now();
  console.log(`Starting to import authors from file: ${filePath}`);
  console.log(`Using batch size of: ${batchSize} records`);
  console.log(getMemoryUsage());
  
  // Create a readable stream from the file
  const fileStream = fs.createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: 256 * 1024, // 256KB chunks for faster reading
  });

  // Create readline interface to process the file line by line
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Initialize AuthorService
  const authorService = new AuthorService();
  
  let lineCount = 0;
  let importedCount = 0;
  let errorCount = 0;
  let batchCount = 0;
  let batch: CreateAuthorInput[] = [];
  let lastReportTime = Date.now();
  let lastReportLine = 0;
  
  console.log('Import started...');
  
  // Process each line
  for await (const line of rl) {
    if (line.trim() === '') continue; // Skip empty lines
    
    // Parse tab-separated values
    const fields = line.split('\t');
    
    if (fields.length >= 5) {
      const type = fields[0];
      const key = fields[1].replace('/authors/', ''); // Strip the /authors/ prefix
      const revision = fields[2];
      const lastModified = fields[3];
      const rawData = fields[4];
      
      // Only process author records
      if (type === '/type/author') {
        try {
          // Parse the raw JSON data
          const authorData = JSON.parse(rawData);
          
          // Extract key and clean it
          const cleanKey = key.replace('/authors/', '').replace('OL', '').replace('A', '');
          
          // Check the bio format and extract actual text if it's an object
          let bioText = '';
          if (authorData.bio) {
            if (typeof authorData.bio === 'object' && authorData.bio.value) {
              bioText = authorData.bio.value;
            } else if (typeof authorData.bio === 'string') {
              bioText = authorData.bio;
            }
          } else if (authorData.wikipedia_excerpt) {
            if (typeof authorData.wikipedia_excerpt === 'object' && authorData.wikipedia_excerpt.value) {
              bioText = authorData.wikipedia_excerpt.value;
            } else if (typeof authorData.wikipedia_excerpt === 'string') {
              bioText = authorData.wikipedia_excerpt;
            }
          }
          
          // Create author record for database
          const author: CreateAuthorInput = {
            olid: key,
            name: authorData.name || 'Unknown',
            birth_date: authorData.created?.value ? new Date(authorData.created.value) : null,
            alternate_names: Array.isArray(authorData.alternate_names) ? authorData.alternate_names : [],
            link: `https://openlibrary.org${authorData.key || '/authors/'+key}`,
            rating_count: 0, // Default values, to be updated later if available
            average_rating: 0,
            gender: Gender.others, // Default gender, to be updated later if possible
            image_url: authorData.photos && Array.isArray(authorData.photos) && authorData.photos.length > 0 
              ? `https://covers.openlibrary.org/a/id/${authorData.photos[0]}-L.jpg` 
              : undefined,
            about: bioText,
          };
          
          batch.push(author);
          lineCount++;
        } catch (error) {
          console.error(`Error parsing author data at line ${lineCount + 1}:`, error);
          errorCount++;
        }
      } else {
        // Not an author record, just count it
        lineCount++;
      }
    } else {
      console.warn(`Warning: Line ${lineCount + 1} has fewer than 5 fields`);
      lineCount++;
    }
    
    // Log processing rate every 30 seconds
    const now = Date.now();
    if (now - lastReportTime > 30000) {
      const elapsed = (now - lastReportTime) / 1000;
      const processed = lineCount - lastReportLine;
      const rate = processed / elapsed;
      console.log(`Processing rate: ${Math.round(rate)} lines/sec | ${getMemoryUsage()}`);
      console.log(`Imported: ${importedCount}, Errors: ${errorCount}`);
      lastReportTime = now;
      lastReportLine = lineCount;
    }
    
    // When batch is full, process it
    if (batch.length >= batchSize) {
      try {
        const result = await authorService.createMany(batch);
        importedCount += result.count;
        batchCount++;
        console.log(`Batch ${batchCount} completed. Imported ${result.count} records.`);
      } catch (error) {
        console.error(`Error importing batch ${batchCount}:`, error);
        errorCount += batch.length;
      }
      
      batch = [];
      
      // Force garbage collection if it's available
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  // Process any remaining items in the last batch
  if (batch.length > 0) {
    try {
      const result = await authorService.createMany(batch);
      importedCount += result.count;
      batchCount++;
      console.log(`Final batch ${batchCount} completed. Imported ${result.count} records.`);
    } catch (error) {
      console.error(`Error importing final batch:`, error);
      errorCount += batch.length;
    }
  }
  
  const endTime = Date.now();
  const totalTimeSeconds = (endTime - startTime) / 1000;
  const avgRate = lineCount / totalTimeSeconds;
  
  console.log(`Import completed.`);
  console.log(`Total lines processed: ${lineCount}`);
  console.log(`Total records imported: ${importedCount}`);
  console.log(`Total errors: ${errorCount}`);
  console.log(`Total batches: ${batchCount}`);
  console.log(`Total time: ${totalTimeSeconds.toFixed(2)} seconds`);
  console.log(`Average processing rate: ${avgRate.toFixed(2)} lines/sec`);
  console.log(getMemoryUsage());
}

if (require.main === module) {
  // If this script is run directly
  const args = process.argv.slice(2);
  const filePath = args[0] || path.resolve(__dirname, '../../../../authors.txt');
  const batchSize = args[1] ? parseInt(args[1]) : 50;
  
  // Verify file exists before starting
  if (fs.existsSync(filePath)) {
    console.log(`File found: ${filePath}`);
    const stats = fs.statSync(filePath);
    console.log(`File size: ${formatBytes(stats.size)}`);
  } else {
    console.error(`ERROR: File not found at ${filePath}`);
    process.exit(1);
  }
  
  importAuthors(filePath, batchSize)
    .then(() => console.log('Author import completed successfully'))
    .catch(error => console.error('Error importing authors:', error));
}

export { importAuthors };
