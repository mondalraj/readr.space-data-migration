import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as os from 'os';

/**
 * Interface representing an author record from the TSV file
 */
interface AuthorRecord {
  type: string;
  key: string;
  revision: string;
  lastModified: string;
  rawData: string;
  // Parsed data fields (optional as they depend on the raw data)
  parsedData?: {
    name?: string;
    birthDate?: string;
    deathDate?: string;
    personalName?: string;
    // Additional fields as needed
  };
}

/**
 * Format bytes into human-readable format
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get current memory usage statistics
 */
function getMemoryUsage(): string {
  const memUsage = process.memoryUsage();
  return `Memory Usage: RSS: ${formatBytes(memUsage.rss)} | Heap: ${formatBytes(memUsage.heapUsed)}/${formatBytes(memUsage.heapTotal)}`;
}

/**
 * Processes a large tab-separated values file in streaming fashion
 * to handle files up to several GB in size without memory issues.
 */
async function processLargeFile(filePath: string, batchSize: number = 1000): Promise<void> {
  const startTime = Date.now();
  console.log(`Starting to process file: ${filePath}`);
  console.log(`Using batch size of: ${batchSize} lines`);
  console.log(`System information: ${os.platform()} ${os.arch()}, ${os.cpus().length} cores, ${formatBytes(os.totalmem())} total memory`);
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

  let lineCount = 0;
  let batchCount = 0;
  let batch: AuthorRecord[] = [];
  let lastReportTime = Date.now();
  let lastReportLine = 0;
  
  console.log('Processing started...');
  
  // Process each line
  for await (const line of rl) {
    if (line.trim() === '') continue; // Skip empty lines
    
    // Parse tab-separated values
    const fields = line.split('\t');
    
    if (fields.length >= 5) {
      const authorRecord: AuthorRecord = {
        type: fields[0],
        key: fields[1],
        revision: fields[2],
        lastModified: fields[3],
        rawData: fields[4],
      };
      
      // Attempt to parse the JSON data if needed (but only store it, don't parse it yet to save memory)
      // We'll only parse when we actually need to process the data
      
      batch.push(authorRecord);
      lineCount++;
    } else {
      console.warn(`Warning: Line ${lineCount + 1} has fewer than 5 fields: ${line}`);
      lineCount++;
    }
    
    // Log processing rate every 30 seconds
    const now = Date.now();
    if (now - lastReportTime > 30000) {
      const elapsed = (now - lastReportTime) / 1000;
      const processed = lineCount - lastReportLine;
      const rate = processed / elapsed;
      console.log(`Processing rate: ${Math.round(rate)} lines/sec | ${getMemoryUsage()}`);
      lastReportTime = now;
      lastReportLine = lineCount;
    }
    
    // When batch is full, process it
    if (batch.length >= batchSize) {
      await processBatch(batch, batchCount, lineCount);
      batchCount++;
      batch = [];
      
      // Force garbage collection if it's available
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  // Process any remaining items in the last batch
  if (batch.length > 0) {
    await processBatch(batch, batchCount, lineCount);
    batchCount++;
  }
  
  const endTime = Date.now();
  const totalTimeSeconds = (endTime - startTime) / 1000;
  const avgRate = lineCount / totalTimeSeconds;
  
  console.log(`File processing completed.`);
  console.log(`Total lines processed: ${lineCount}`);
  console.log(`Total batches processed: ${batchCount}`);
  console.log(`Total time: ${totalTimeSeconds.toFixed(2)} seconds`);
  console.log(`Average processing rate: ${avgRate.toFixed(2)} lines/sec`);
  console.log(getMemoryUsage());
}

/**
 * Process a batch of author records
 */
async function processBatch(batch: AuthorRecord[], batchNum: number, currentLineCount: number): Promise<void> {
  console.log(`Processing batch ${batchNum + 1} (lines ${currentLineCount - batch.length + 1}-${currentLineCount})`);
  
  // For demonstration, we'll parse and extract some data from the first and last records
  if (batch.length > 0) {
    // Parse first record
    try {
      const firstRecord = batch[0];
      const parsedData = JSON.parse(firstRecord.rawData);
      console.log(`First record: Type: ${firstRecord.type}, Key: ${firstRecord.key}, Name: ${parsedData.name || 'N/A'}`);
      
      // Parse last record
      const lastRecord = batch[batch.length - 1];
      const lastParsedData = JSON.parse(lastRecord.rawData);
      console.log(`Last record: Type: ${lastRecord.type}, Key: ${lastRecord.key}, Name: ${lastParsedData.name || 'N/A'}`);
    } catch (error) {
      console.error('Error parsing record JSON:', error);
    }
    
    // Here you would typically process the entire batch
    // e.g., save to database, transform data, etc.
    
    // For this sample, we'll just summarize the batch
    const typeDistribution: Record<string, number> = {};
    
    for (const record of batch) {
      typeDistribution[record.type] = (typeDistribution[record.type] || 0) + 1;
    }
    
    console.log('Type distribution in this batch:', typeDistribution);
  }
}

// Path to the authors.txt file (5GB)
const filePath = path.join(__dirname, '../../authors.txt');

// Process the file with a batch size of 10000 lines
processLargeFile(filePath, 10000)
  .then(() => console.log('Processing completed successfully'))
  .catch(error => console.error('Error processing file:', error));
