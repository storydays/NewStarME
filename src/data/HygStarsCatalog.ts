import { HygRecord } from '../types';

/**
 * HygStarsCatalog Class - Raw HYG Data Management
 * 
 * Purpose: Handles loading and parsing of the HYG (HipparcoS, Yale, Gliese) star catalog.
 * This class is responsible for the raw astronomical data before any application-specific processing.
 * 
 * Features:
 * - Loads HYG catalog from CSV files (compressed or uncompressed)
 * - Parses CSV data into HygRecord objects
 * - Provides basic filtering and access methods
 * - Handles data validation and error recovery
 * 
 * Confidence Rating: High - Standard CSV parsing with astronomical data
 */

export class HygStarsCatalog {
  private stars: HygRecord[] = [];
  private loaded: boolean = false;

  constructor(stars: HygRecord[] = []) {
    this.stars = stars;
    this.loaded = stars.length > 0;
  }

  /**
   * Factory method to create HygStarsCatalog from URL
   */
  static async fromUrl(url: string, compressed: boolean = true): Promise<HygStarsCatalog> {
    console.log(`HygStarsCatalog: Loading catalog from ${url} (compressed: ${compressed})`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch catalog: ${response.status} ${response.statusText}`);
      }

      let csvText: string;
      
      if (compressed) {
        // Handle compressed data
        const arrayBuffer = await response.arrayBuffer();
        const decompressed = await this.decompressGzip(arrayBuffer);
        csvText = new TextDecoder().decode(decompressed);
      } else {
        csvText = await response.text();
      }

      const stars = this.parseCsvData(csvText);
      console.log(`HygStarsCatalog: Loaded ${stars.length} stars from catalog`);
      
      return new HygStarsCatalog(stars);
    } catch (error) {
      console.error('Error loading HYG catalog:', error);
      throw error;
    }
  }

  /**
   * Decompress gzip data using browser's DecompressionStream
   */
  private static async decompressGzip(compressedData: ArrayBuffer): Promise<Uint8Array> {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(new Uint8Array(compressedData));
    writer.close();
    
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  }

  /**
   * Parse CSV data into HygRecord objects
   */
  private static parseCsvData(csvText: string): HygRecord[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log(`HygStarsCatalog: Parsing ${lines.length - 1} star records`);
    
    const stars: HygRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCsvLine(lines[i]);
        if (values.length !== headers.length) {
          console.warn(`HygStarsCatalog: Line ${i + 1} has ${values.length} values, expected ${headers.length}`);
          continue;
        }
        
        const record = this.createHygRecord(headers, values);
        if (record) {
          stars.push(record);
        }
      } catch (error) {
        console.warn(`HygStarsCatalog: Error parsing line ${i + 1}:`, error);
      }
    }
    
    return stars;
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  private static parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Create HygRecord from parsed CSV data
   */
  private static createHygRecord(headers: string[], values: string[]): HygRecord | null {
    try {
      const getValue = (header: string): string => {
        const index = headers.indexOf(header);
        return index >= 0 ? values[index] : '';
      };

      const getNumber = (header: string): number => {
        const value = getValue(header);
        return value ? parseFloat(value) : 0;
      };

      const getInteger = (header: string): number => {
        const value = getValue(header);
        return value ? parseInt(value, 10) : 0;
      };

      // Required fields
      const id = getInteger('id');
      if (!id) return null;

      const record: HygRecord = {
        id,
        hip: getInteger('hip') || undefined,
        hd: getInteger('hd') || undefined,
        hr: getInteger('hr') || undefined,
        gl: getValue('gl') || undefined,
        bf: getValue('bf') || undefined,
        proper: getValue('proper') || undefined,
        ra: getNumber('ra'),
        dec: getNumber('dec'),
        dist: getNumber('dist'),
        pmra: getNumber('pmra'),
        pmdec: getNumber('pmdec'),
        rv: getNumber('rv'),
        mag: getNumber('mag'),
        absmag: getNumber('absmag'),
        spect: getValue('spect') || undefined,
        ci: getNumber('ci'),
        x: getNumber('x'),
        y: getNumber('y'),
        z: getNumber('z'),
        vx: getNumber('vx'),
        vy: getNumber('vy'),
        vz: getNumber('vz'),
        rarad: getNumber('rarad'),
        decrad: getNumber('decrad'),
        pmrarad: getNumber('pmrarad'),
        pmdecrad: getNumber('pmdecrad'),
        bayer: getValue('bayer') || undefined,
        flam: getInteger('flam') || undefined,
        con: getValue('con') || undefined,
        comp: getInteger('comp') || undefined,
        comp_primary: getInteger('comp_primary') || undefined,
        base: getValue('base') || undefined,
        lum: getNumber('lum'),
        var: getValue('var') || undefined,
        var_min: getNumber('var_min') || undefined,
        var_max: getNumber('var_max') || undefined
      };

      return record;
    } catch (error) {
      console.warn('Error creating HygRecord:', error);
      return null;
    }
  }

  /**
   * Get all stars
   */
  getStars(): HygRecord[] {
    return this.stars;
  }

  /**
   * Get star by ID
   */
  getStarById(id: number): HygRecord | undefined {
    return this.stars.find(star => star.id === id);
  }

  /**
   * Get total number of stars
   */
  getTotalStars(): number {
    return this.stars.length;
  }

  /**
   * Get stars by magnitude range
   */
  getStarsByMagnitude(minMag: number, maxMag: number): HygRecord[] {
    return this.stars.filter(star => star.mag >= minMag && star.mag <= maxMag);
  }

  /**
   * Get stars with proper names
   */
  getNamedStars(): HygRecord[] {
    return this.stars.filter(star => star.proper && star.proper.trim() !== '');
  }

  /**
   * Check if catalog is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

export default HygStarsCatalog;