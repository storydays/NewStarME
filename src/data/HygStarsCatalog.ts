import Papa from 'papaparse';
import { HygRecord } from '../types';

/**
 * HygStarsCatalog Class - Raw HYG Data Management with Papa Parse
 * 
 * Purpose: Handles loading and parsing of the HYG (HipparcoS, Yale, Gliese) star catalog.
 * This class is responsible for the raw astronomical data before any application-specific processing.
 * 
 * Features:
 * - Loads HYG catalog from CSV files (compressed or uncompressed)
 * - Uses Papa Parse for robust CSV parsing
 * - Parses CSV data into HygRecord objects
 * - Provides basic filtering and access methods
 * - Handles data validation and error recovery
 * - Properly handles BOM characters and CSV edge cases
 * 
 * Confidence Rating: High - Using Papa Parse for reliable CSV parsing
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

      const stars = this.parseCsvDataWithPapa(csvText);
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
   * Parse CSV data using Papa Parse library
   * This replaces the custom CSV parsing with a robust library solution
   */
  private static parseCsvDataWithPapa(csvText: string): HygRecord[] {
    console.log('HygStarsCatalog: Parsing CSV data with Papa Parse...');
    
    try {
      // Use Papa Parse to parse the CSV
      const parseResult = Papa.parse<string[]>(csvText, {
        header: false, // We'll handle headers manually for better control
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings for manual type conversion
        comments: '#', // Skip comment lines
        delimiter: ',',
        quoteChar: '"',
        escapeChar: '"',
        transformHeader: (header: string, index: number) => {
          // Clean header and remove BOM from first header
          let cleanHeader = header.trim();
          if (index === 0 && cleanHeader.charCodeAt(0) === 0xFEFF) {
            cleanHeader = cleanHeader.substring(1);
            console.log('HygStarsCatalog: Removed BOM character from first header');
          }
          return cleanHeader;
        }
      });

      if (parseResult.errors.length > 0) {
        console.warn('HygStarsCatalog: Papa Parse warnings:', parseResult.errors);
      }

      const rows = parseResult.data;
      if (rows.length < 2) {
        throw new Error('CSV file appears to be empty or invalid');
      }

      // Extract and clean headers from first row
      const rawHeaders = rows[0];
      const headers = rawHeaders.map((header, index) => {
        let cleanHeader = header.trim();
        // Remove BOM character from the first header if present
        if (index === 0 && cleanHeader.charCodeAt(0) === 0xFEFF) {
          cleanHeader = cleanHeader.substring(1);
          console.log('HygStarsCatalog: Removed BOM character from first header');
        }
        return cleanHeader;
      });

      console.log(`HygStarsCatalog: Parsed headers:`, headers);
      console.log(`HygStarsCatalog: Processing ${rows.length - 1} star records`);

      const stars: HygRecord[] = [];
      
      // Process data rows (skip header row)
      for (let i = 1; i < rows.length; i++) {
        try {
          const values = rows[i];
          if (values.length !== headers.length) {
            console.warn(`HygStarsCatalog: Row ${i + 1} has ${values.length} values, expected ${headers.length}`);
            continue;
          }
          
          const record = this.createHygRecord(headers, values);
          if (record) {
            stars.push(record);
          }
        } catch (error) {
          console.warn(`HygStarsCatalog: Error parsing row ${i + 1}:`, error);
        }
      }

      console.log(`HygStarsCatalog: Successfully parsed ${stars.length} star records using Papa Parse`);
      return stars;

    } catch (error) {
      console.error('HygStarsCatalog: Papa Parse error:', error);
      throw new Error(`Failed to parse CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create HygRecord from parsed CSV data
   * Enhanced with better error logging and validation
   */
  private static createHygRecord(headers: string[], values: string[]): HygRecord | null {
    try {
      const getValue = (header: string): string => {
        const index = headers.indexOf(header);
        if (index === -1) {
          // Only log this once per header to avoid spam
          if (!this.missingHeadersLogged) {
            this.missingHeadersLogged = new Set();
          }
          if (!this.missingHeadersLogged.has(header)) {
            console.warn(`HygStarsCatalog: Header '${header}' not found in headers`);
            this.missingHeadersLogged.add(header);
          }
          return '';
        }
        return values[index]?.trim() || '';
      };

      const getNumber = (header: string): number => {
        const value = getValue(header);
        if (!value || value === '') return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const getInteger = (header: string): number => {
        const value = getValue(header);
        if (!value || value === '') return 0;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      const getOptionalNumber = (header: string): number | undefined => {
        const value = getValue(header);
        if (!value || value === '') return undefined;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
      };

      const getOptionalInteger = (header: string): number | undefined => {
        const value = getValue(header);
        if (!value || value === '') return undefined;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? undefined : parsed;
      };

      const getOptionalString = (header: string): string | undefined => {
        const value = getValue(header);
        return value && value !== '' ? value : undefined;
      };

      // Required fields - validate ID exists
      const id = getInteger('id');
      if (!id || id === 0) {
        return null; // Skip records without valid ID
      }

      // Build the HygRecord with proper type handling
      const record: HygRecord = {
        id,
        hip: getOptionalInteger('hip'),
        hd: getOptionalInteger('hd'),
        hr: getOptionalInteger('hr'),
        gl: getOptionalString('gl'),
        bf: getOptionalString('bf'),
        proper: getOptionalString('proper'),
        ra: getNumber('ra'),
        dec: getNumber('dec'),
        dist: getNumber('dist'),
        pmra: getOptionalNumber('pmra'),
        pmdec: getOptionalNumber('pmdec'),
        rv: getOptionalNumber('rv'),
        mag: getNumber('mag'),
        absmag: getNumber('absmag'),
        spect: getOptionalString('spect'),
        ci: getOptionalNumber('ci'),
        x: getNumber('x'),
        y: getNumber('y'),
        z: getNumber('z'),
        vx: getOptionalNumber('vx'),
        vy: getOptionalNumber('vy'),
        vz: getOptionalNumber('vz'),
        rarad: getNumber('rarad'),
        decrad: getNumber('decrad'),
        pmrarad: getOptionalNumber('pmrarad'),
        pmdecrad: getOptionalNumber('pmdecrad'),
        bayer: getOptionalString('bayer'),
        flam: getOptionalInteger('flam'),
        con: getOptionalString('con'),
        comp: getOptionalInteger('comp'),
        comp_primary: getOptionalInteger('comp_primary'),
        base: getOptionalString('base'),
        lum: getOptionalNumber('lum'),
        var: getOptionalString('var'),
        var_min: getOptionalNumber('var_min'),
        var_max: getOptionalNumber('var_max')
      };

      return record;
    } catch (error) {
      console.warn('HygStarsCatalog: Error creating HygRecord:', error);
      return null;
    }
  }

  // Static property to track missing headers (avoid log spam)
  private static missingHeadersLogged: Set<string>;

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
   * Get stars by constellation
   */
  getStarsByConstellation(constellation: string): HygRecord[] {
    const conLower = constellation.toLowerCase();
    return this.stars.filter(star => star.con?.toLowerCase() === conLower);
  }

  /**
   * Get variable stars
   */
  getVariableStars(): HygRecord[] {
    return this.stars.filter(star => star.var && star.var.trim() !== '');
  }

  /**
   * Filter stars by distance range (in parsecs)
   */
  getStarsByDistance(minDist: number, maxDist: number): HygRecord[] {
    return this.stars.filter(star => star.dist >= minDist && star.dist <= maxDist);
  }

  /**
   * Filter stars by spectral class
   */
  getStarsBySpectralClass(spectralClass: string): HygRecord[] {
    const spectLower = spectralClass.toLowerCase();
    return this.stars.filter(star => 
      star.spect?.toLowerCase().startsWith(spectLower)
    );
  }

  /**
   * Search stars by name (proper name, Bayer designation, etc.)
   */
  searchStarsByName(query: string): HygRecord[] {
    const queryLower = query.toLowerCase();
    return this.stars.filter(star => {
      const properName = star.proper?.toLowerCase() || '';
      const bayerName = star.bayer?.toLowerCase() || '';
      const catalogName = `hyg ${star.id}`.toLowerCase();
      
      return properName.includes(queryLower) || 
             bayerName.includes(queryLower) || 
             catalogName.includes(queryLower);
    });
  }

  /**
   * Check if catalog is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

export default HygStarsCatalog;