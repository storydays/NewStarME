import { HygStarsCatalog } from './StarsCatalog';
import { HygRecord, HygStarData } from '../types';

/**
 * StarsCatalog Class - Central Star Data Management
 * 
 * Purpose: Provides a unified interface for accessing star data throughout the application.
 * This is the single source of truth for all star-related operations.
 * 
 * Features:
 * - Wraps HygStarsCatalog with application-specific enhancements
 * - Converts raw HYG data to enriched HygStarData format
 * - Provides filtering and search capabilities
 * - Manages rendering metadata for 3D visualization
 * - Caches processed data for performance
 * 
 * Confidence Rating: High - Clean abstraction over HYG catalog
 */

export class StarsCatalog {
  private hygCatalog: HygStarsCatalog;
  private processedStars: Map<number, HygStarData> = new Map();
  private initialized: boolean = false;

  constructor(hygCatalog: HygStarsCatalog) {
    this.hygCatalog = hygCatalog;
    console.log(`StarsCatalog: Initialized with ${hygCatalog.getTotalStars()} stars from HYG catalog`);
  }

  /**
   * Factory method to create StarsCatalog from HYG catalog
   */
  static async fromHygCatalog(hygCatalog: HygStarsCatalog): Promise<StarsCatalog> {
    const catalog = new StarsCatalog(hygCatalog);
    await catalog.initialize();
    return catalog;
  }

  /**
   * Initialize the catalog by processing HYG data into HygStarData format
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('StarsCatalog: Processing HYG data into enriched format...');
    
    const hygStars = this.hygCatalog.getStars();
    let processedCount = 0;

    for (const hygStar of hygStars) {
      const enrichedStar = this.enrichHygRecord(hygStar);
      this.processedStars.set(hygStar.id, enrichedStar);
      processedCount++;

      // Log progress for large datasets
      if (processedCount % 10000 === 0) {
        console.log(`StarsCatalog: Processed ${processedCount}/${hygStars.length} stars`);
      }
    }

    this.initialized = true;
    console.log(`StarsCatalog: Initialization complete. Processed ${processedCount} stars.`);
  }

  /**
   * Convert HygRecord to enriched HygStarData format
   */
  private enrichHygRecord(hygRecord: HygRecord): HygStarData {
    // Convert spherical coordinates to Cartesian for 3D positioning
    const distance = Math.min(hygRecord.dist, 100) / 5;
    const raRad = hygRecord.rarad;
    const decRad = hygRecord.decrad;
    
    const x = distance * Math.cos(decRad) * Math.cos(raRad);
    const y = distance * Math.cos(decRad) * Math.sin(raRad);
    const z = distance * Math.sin(decRad);

    // Calculate visual properties based on astronomical data
    const brightness = Math.max(0.3, Math.min(1.0, 1.2 - 0.07 * hygRecord.mag));
    const size = Math.max(0.8, Math.min(1.6, brightness * 1.5));
    
    // Color based on spectral class
    let color = '#F8F8FF'; // Default white
    if (hygRecord.spect) {
      const spectralClass = hygRecord.spect.charAt(0).toUpperCase();
      switch (spectralClass) {
        case 'O': case 'B': color = '#B0C4DE'; break; // Blue
        case 'A': color = '#F8F8FF'; break; // White
        case 'F': color = '#FFFACD'; break; // Yellow-white
        case 'G': color = '#FFE4B5'; break; // Yellow
        case 'K': color = '#FFA500'; break; // Orange
        case 'M': color = '#FF6347'; break; // Red
      }
    }

    return {
      hyg: hygRecord,
      render: {
        color,
        size,
        brightness,
        position: [x, y, z],
        isHighlighted: false,
        emotionColor: undefined
      }
    };
  }

  /**
   * Get a single star by HYG ID
   */
  getStarById(id: number): HygStarData | null {
    return this.processedStars.get(id) || null;
  }

  /**
   * Get all stars as HygStarData array
   */
  getAllStars(): HygStarData[] {
    return Array.from(this.processedStars.values());
  }

  /**
   * Get stars filtered by magnitude range
   */
  getStarsByMagnitude(minMag: number, maxMag: number): HygStarData[] {
    return this.getAllStars().filter(star => 
      star.hyg.mag >= minMag && star.hyg.mag <= maxMag
    );
  }

  /**
   * Get only stars with proper names
   */
  getNamedStars(): HygStarData[] {
    return this.getAllStars().filter(star => 
      star.hyg.proper && star.hyg.proper.trim() !== ''
    );
  }

  /**
   * Get stars by constellation
   */
  getStarsByConstellation(constellation: string): HygStarData[] {
    const conLower = constellation.toLowerCase();
    return this.getAllStars().filter(star => 
      star.hyg.con?.toLowerCase() === conLower
    );
  }

  /**
   * Get variable stars
   */
  getVariableStars(): HygStarData[] {
    return this.getAllStars().filter(star => 
      star.hyg.var && star.hyg.var.trim() !== ''
    );
  }

  /**
   * Search stars by name (proper name or catalog designation)
   */
  searchStarsByName(query: string): HygStarData[] {
    const queryLower = query.toLowerCase();
    return this.getAllStars().filter(star => {
      const properName = star.hyg.proper?.toLowerCase() || '';
      const catalogName = `hyg ${star.hyg.id}`.toLowerCase();
      const bayerName = star.hyg.bayer?.toLowerCase() || '';
      
      return properName.includes(queryLower) || 
             catalogName.includes(queryLower) || 
             bayerName.includes(queryLower);
    });
  }

  /**
   * Update rendering properties for a star
   */
  updateStarRender(id: number, renderUpdates: Partial<HygStarData['render']>): boolean {
    const star = this.processedStars.get(id);
    if (!star) return false;

    star.render = { ...star.render, ...renderUpdates };
    return true;
  }

  /**
   * Highlight multiple stars with emotion-based coloring
   */
  highlightStars(starIds: number[], emotionColor?: string): void {
    console.log(`StarsCatalog: Highlighting ${starIds.length} stars with emotion color: ${emotionColor}`);
    
    // First, clear all existing highlights
    this.clearHighlights();
    
    // Then highlight the specified stars
    starIds.forEach(id => {
      this.updateStarRender(id, {
        isHighlighted: true,
        emotionColor: emotionColor
      });
    });
  }

  /**
   * Clear all star highlights
   */
  clearHighlights(): void {
    console.log('StarsCatalog: Clearing all star highlights');
    
    this.processedStars.forEach(star => {
      star.render.isHighlighted = false;
      star.render.emotionColor = undefined;
    });
  }

  /**
   * Get total number of stars
   */
  getTotalStars(): number {
    return this.processedStars.size;
  }

  /**
   * Get the underlying HYG catalog (for advanced operations)
   */
  getHygCatalog(): HygStarsCatalog {
    return this.hygCatalog;
  }

  /**
   * Get stars suitable for emotion-based selection
   */
  getStarsForEmotion(emotionId: string, count: number = 5): HygStarData[] {
    console.log(`StarsCatalog: Selecting stars for emotion: ${emotionId}`);
    
    let candidateStars = this.getNamedStars();

    // Apply emotion-specific filtering
    switch (emotionId) {
      case 'love':
        // Bright, warm stars (often red/orange)
        candidateStars = candidateStars.filter(star => 
          star.hyg.mag < 4.0 && 
          (star.hyg.spect?.startsWith('K') || star.hyg.spect?.startsWith('M') || star.hyg.spect?.startsWith('G'))
        );
        break;
      
      case 'friendship':
        // Stable, reliable stars (main sequence)
        candidateStars = candidateStars.filter(star => 
          star.hyg.mag < 4.5 && 
          (star.hyg.spect?.startsWith('G') || star.hyg.spect?.startsWith('F'))
        );
        break;
      
      case 'family':
        // Multiple star systems when available
        candidateStars = candidateStars.filter(star => 
          star.hyg.mag < 4.0 && star.hyg.comp && star.hyg.comp > 1
        );
        break;
      
      case 'milestones':
        // Very bright, prominent stars
        candidateStars = candidateStars.filter(star => star.hyg.mag < 2.0);
        break;
      
      case 'memorial':
        // Variable stars (representing eternal change/memory)
        const variableStars = this.getVariableStars().filter(star => star.hyg.proper);
        if (variableStars.length >= count) {
          candidateStars = variableStars;
        }
        break;
      
      case 'healing':
        // Gentle, moderate brightness stars
        candidateStars = candidateStars.filter(star => 
          star.hyg.mag >= 2.0 && star.hyg.mag < 4.0 &&
          (star.hyg.spect?.startsWith('F') || star.hyg.spect?.startsWith('A'))
        );
        break;
      
      case 'adventure':
        // Navigation stars (bright, well-known)
        candidateStars = candidateStars.filter(star => 
          star.hyg.mag < 3.0 && star.hyg.proper && star.hyg.proper.length > 0
        );
        break;
      
      case 'creativity':
        // Unique spectral classes or unusual stars
        candidateStars = candidateStars.filter(star => 
          star.hyg.spect && (
            star.hyg.spect.includes('e') || // Emission lines
            star.hyg.spect.startsWith('B') || // Hot blue stars
            star.hyg.spect.startsWith('O')
          )
        );
        break;
      
      default:
        // General bright stars
        candidateStars = candidateStars.filter(star => star.hyg.mag < 4.0);
    }

    // If we don't have enough candidates, fall back to bright named stars
    if (candidateStars.length < count) {
      candidateStars = this.getNamedStars()
        .filter(star => star.hyg.mag < 4.0)
        .sort((a, b) => a.hyg.mag - b.hyg.mag);
    }

    // Select random stars from candidates
    const selectedStars = candidateStars
      .sort(() => 0.5 - Math.random())
      .slice(0, count);

    console.log(`StarsCatalog: Selected ${selectedStars.length} stars for emotion ${emotionId}`);
    return selectedStars;
  }
}

export default StarsCatalog;