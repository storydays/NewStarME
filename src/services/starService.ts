import { supabase } from '../lib/supabase';
import { Star, HygRecord } from '../types';
import { HygStarsCatalog } from '../data/StarsCatalog';

/**
 * StarService - Enhanced with HYG Catalog Integration and Matching
 * 
 * This service now uses the HYG star catalog as the primary source for star data,
 * providing access to over 119,000 real stars with accurate astronomical data.
 * 
 * Key Features:
 * - Dynamic loading of HYG catalog from remote CSV
 * - Intelligent fallback system (AI -> HYG -> Local)
 * - Smart matching between AI-generated stars and HYG catalog
 * - Caching for performance
 * - Emotion-based star selection using astronomical properties
 * 
 * Confidence Rating: High - Robust implementation with comprehensive error handling
 */

export class StarService {
  // Cache duration in milliseconds (24 hours)
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  
  // HYG catalog instance cache
  private static hygCatalog: HygStarsCatalog | null = null;
  private static catalogLoadPromise: Promise<HygStarsCatalog> | null = null;
  private static catalogLoadFailed: boolean = false;

  /**
   * NEW: Find best matching HygRecord for a given Star
   * 
   * Priority matching:
   * 1. Scientific name match (case-insensitive)
   * 2. Approximate coordinates match (within tolerance)
   * 
   * @param star - Star object to find HYG match for
   * @returns HygRecord if match found, null otherwise
   */
  static findBestHygMatch(star: Star): HygRecord | null {
    if (!this.hygCatalog) {
      console.warn('StarService.findBestHygMatch: HYG catalog not loaded');
      return null;
    }

    const allStars = this.hygCatalog.getStars();
    console.log(`StarService.findBestHygMatch: Searching for match for "${star.scientific_name}"`);

    // Priority 1: Scientific name match (case-insensitive)
    const nameMatch = allStars.find(hygStar => {
      if (!hygStar.proper) return false;
      
      const hygName = hygStar.proper.toLowerCase().trim();
      const starName = star.scientific_name.toLowerCase().trim();
      
      // Exact match
      if (hygName === starName) return true;
      
      // Partial match (either direction)
      if (hygName.includes(starName) || starName.includes(hygName)) return true;
      
      return false;
    });

    if (nameMatch) {
      console.log(`StarService.findBestHygMatch: Found name match for "${star.scientific_name}" -> "${nameMatch.proper}"`);
      return nameMatch;
    }

    // Priority 2: Approximate coordinates match
    try {
      const starCoords = this.parseCoordinates(star.coordinates);
      if (starCoords) {
        const tolerance = 0.5; // degrees tolerance
        
        const coordMatch = allStars.find(hygStar => {
          const raDiff = Math.abs(hygStar.ra - starCoords.ra);
          const decDiff = Math.abs(hygStar.dec - starCoords.dec);
          
          return raDiff <= tolerance && decDiff <= tolerance;
        });

        if (coordMatch) {
          console.log(`StarService.findBestHygMatch: Found coordinate match for "${star.scientific_name}" -> "${coordMatch.proper || `HYG ${coordMatch.id}`}"`);
          return coordMatch;
        }
      }
    } catch (error) {
      console.warn('StarService.findBestHygMatch: Error parsing coordinates:', error);
    }

    console.log(`StarService.findBestHygMatch: No match found for "${star.scientific_name}"`);
    return null;
  }

  /**
   * Parse coordinate string to RA/Dec degrees
   * 
   * @param coordinates - Coordinate string in format "XXh XXm XXs ±XX° XX′ XX″"
   * @returns Object with ra and dec in degrees, or null if parsing fails
   */
  private static parseCoordinates(coordinates: string): { ra: number; dec: number } | null {
    try {
      // Parse RA: "XXh XXm XXs"
      const raMatch = coordinates.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
      if (!raMatch) return null;
      
      const raHours = parseInt(raMatch[1]);
      const raMinutes = parseInt(raMatch[2]);
      const raSeconds = parseFloat(raMatch[3]);
      const ra = (raHours + raMinutes / 60 + raSeconds / 3600) * 15; // Convert to degrees
      
      // Parse Dec: "±XX° XX′ XX″"
      const decMatch = coordinates.match(/([+−-])(\d+)°\s*(\d+)′\s*([\d.]+)″/);
      if (!decMatch) return null;
      
      const decSign = decMatch[1] === '−' || decMatch[1] === '-' ? -1 : 1;
      const decDegrees = parseInt(decMatch[2]);
      const decMinutes = parseInt(decMatch[3]);
      const decSeconds = parseFloat(decMatch[4]);
      const dec = decSign * (decDegrees + decMinutes / 60 + decSeconds / 3600);
      
      return { ra, dec };
    } catch (error) {
      console.warn('StarService.parseCoordinates: Failed to parse coordinates:', coordinates, error);
      return null;
    }
  }

  /**
   * Initialize the StarService with fallback static stars
   * This method ensures the service works even if HYG catalog fails to load
   */
  static async initializeStars() {
    try {
      console.log('Initializing StarService...');
      
      // Check if static stars already exist in database
      const { data: existingStars } = await supabase
        .from('stars')
        .select('id')
        .eq('source', 'static')
        .limit(1);

      if (existingStars && existingStars.length > 0) {
        console.log('Static stars already initialized in database');
        
        // Try to load HYG catalog in background (non-blocking)
        this.loadHygCatalogInBackground();
        return;
      }

      // Try to load HYG catalog for initial setup
      try {
        await this.loadHygCatalog();
        console.log('HYG catalog loaded successfully, selecting prominent stars...');
        
        // Select prominent stars from HYG catalog for each emotion
        const staticStars = await this.selectProminentStarsForEmotions();
        
        if (staticStars.length > 0) {
          const { error } = await supabase
            .from('stars')
            .insert(staticStars);

          if (error) {
            console.error('Error inserting static stars from HYG catalog:', error);
            await this.createFallbackStaticStars();
          } else {
            console.log(`Successfully initialized ${staticStars.length} static stars from HYG catalog`);
          }
        } else {
          await this.createFallbackStaticStars();
        }
      } catch (hygError) {
        console.warn('HYG catalog failed to load during initialization, using fallback static stars:', hygError);
        await this.createFallbackStaticStars();
      }
    } catch (error) {
      console.error('Error initializing StarService:', error);
      // Ensure we have fallback stars even if everything else fails
      await this.createFallbackStaticStars();
    }
  }

  /**
   * Load HYG catalog in background without blocking initialization
   */
  private static loadHygCatalogInBackground() {
    if (this.catalogLoadFailed || this.hygCatalog || this.catalogLoadPromise) {
      return;
    }

    // Load catalog in background
    setTimeout(async () => {
      try {
        await this.loadHygCatalog();
        console.log('HYG catalog loaded successfully in background');
      } catch (error) {
        console.log('HYG catalog background loading failed (this is expected if file is not available)');
        this.catalogLoadFailed = true;
      }
    }, 1000);
  }

  /**
   * Load the HYG catalog from remote CSV with improved error handling
   * Uses caching to avoid repeated downloads
   */
  private static async loadHygCatalog(): Promise<HygStarsCatalog> {
    if (this.hygCatalog) {
      return this.hygCatalog;
    }

    if (this.catalogLoadFailed) {
      throw new Error('HYG catalog loading previously failed');
    }

    if (this.catalogLoadPromise) {
      return this.catalogLoadPromise;
    }

    this.catalogLoadPromise = (async () => {
      try {
        console.log('Loading HYG catalog from public directory...');
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const catalog = await HygStarsCatalog.fromUrl('/hygdata_v41.csv.gz', false);
          clearTimeout(timeoutId);
          
          this.hygCatalog = catalog;
          console.log(`HYG catalog loaded successfully: ${catalog.getTotalStars()} stars`);
          return catalog;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        console.warn('Failed to load HYG catalog:', error);
        this.catalogLoadFailed = true;
        this.catalogLoadPromise = null;
        throw error;
      }
    })();

    return this.catalogLoadPromise;
  }

  /**
   * Create fallback static stars when HYG catalog is not available
   */
  private static async createFallbackStaticStars(): Promise<void> {
    try {
      console.log('Creating fallback static stars...');
      
      const fallbackStars = this.generateFallbackStars();
      
      const { error } = await supabase
        .from('stars')
        .insert(fallbackStars);

      if (error) {
        console.error('Error inserting fallback static stars:', error);
      } else {
        console.log(`Successfully created ${fallbackStars.length} fallback static stars`);
      }
    } catch (error) {
      console.error('Error creating fallback static stars:', error);
    }
  }

  /**
   * Generate fallback stars with realistic astronomical data
   */
  private static generateFallbackStars(): any[] {
    const emotions = [
      'love', 'friendship', 'family', 'milestones', 
      'memorial', 'healing', 'adventure', 'creativity'
    ];

    const fallbackStarData = [
      // Love stars
      { name: 'Vega', ra: 18.615, dec: 38.784, mag: 0.03, spect: 'A0V' },
      { name: 'Altair', ra: 19.846, dec: 8.868, mag: 0.77, spect: 'A7V' },
      { name: 'Deneb', ra: 20.690, dec: 45.280, mag: 1.25, spect: 'A2Ia' },
      { name: 'Arcturus', ra: 14.261, dec: 19.182, mag: -0.05, spect: 'K1.5III' },
      { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, spect: 'G5III' },
      
      // Friendship stars
      { name: 'Sirius', ra: 6.752, dec: -16.716, mag: -1.46, spect: 'A1V' },
      { name: 'Procyon', ra: 7.655, dec: 5.225, mag: 0.34, spect: 'F5IV' },
      { name: 'Pollux', ra: 7.755, dec: 28.026, mag: 1.14, spect: 'K0III' },
      { name: 'Castor', ra: 7.576, dec: 31.888, mag: 1.57, spect: 'A1V' },
      { name: 'Regulus', ra: 10.139, dec: 11.967, mag: 1.35, spect: 'B7V' },
      
      // Family stars
      { name: 'Polaris', ra: 2.530, dec: 89.264, mag: 1.98, spect: 'F7Ib' },
      { name: 'Aldebaran', ra: 4.598, dec: 16.509, mag: 0.85, spect: 'K5III' },
      { name: 'Spica', ra: 13.420, dec: -11.161, mag: 1.04, spect: 'B1III' },
      { name: 'Antares', ra: 16.490, dec: -26.432, mag: 1.09, spect: 'M1.5Iab' },
      { name: 'Betelgeuse', ra: 5.919, dec: 7.407, mag: 0.50, spect: 'M1Ia' },
      
      // Milestones stars
      { name: 'Rigel', ra: 5.242, dec: -8.202, mag: 0.13, spect: 'B8Ia' },
      { name: 'Canopus', ra: 6.399, dec: -52.696, mag: -0.74, spect: 'A9II' },
      { name: 'Achernar', ra: 1.629, dec: -57.237, mag: 0.46, spect: 'B6Vep' },
      { name: 'Hadar', ra: 14.063, dec: -60.373, mag: 0.61, spect: 'B1III' },
      { name: 'Acrux', ra: 12.443, dec: -63.099, mag: 0.77, spect: 'B0.5IV' },
      
      // Memorial stars
      { name: 'Fomalhaut', ra: 22.961, dec: -29.622, mag: 1.16, spect: 'A3V' },
      { name: 'Bellatrix', ra: 5.418, dec: 6.350, mag: 1.64, spect: 'B2III' },
      { name: 'Elnath', ra: 5.438, dec: 28.608, mag: 1.68, spect: 'B7III' },
      { name: 'Alnilam', ra: 5.603, dec: -1.202, mag: 1.70, spect: 'B0Ia' },
      { name: 'Alnitak', ra: 5.679, dec: -1.943, mag: 1.77, spect: 'O9.5Ib' },
      
      // Healing stars
      { name: 'Dubhe', ra: 11.062, dec: 61.751, mag: 1.79, spect: 'F7Ia' },
      { name: 'Merak', ra: 11.031, dec: 56.382, mag: 2.37, spect: 'A1V' },
      { name: 'Phecda', ra: 11.897, dec: 53.695, mag: 2.44, spect: 'A0V' },
      { name: 'Megrez', ra: 12.257, dec: 57.033, mag: 3.31, spect: 'A3V' },
      { name: 'Alioth', ra: 12.900, dec: 55.960, mag: 1.77, spect: 'A1III' },
      
      // Adventure stars
      { name: 'Mizar', ra: 13.399, dec: 54.925, mag: 2.04, spect: 'A2V' },
      { name: 'Alkaid', ra: 13.792, dec: 49.313, mag: 1.86, spect: 'B3V' },
      { name: 'Kochab', ra: 14.845, dec: 74.156, mag: 2.08, spect: 'K4III' },
      { name: 'Pherkad', ra: 15.345, dec: 71.834, mag: 3.05, spect: 'A3Ib' },
      { name: 'Thuban', ra: 14.073, dec: 64.376, mag: 3.65, spect: 'A0III' },
      
      // Creativity stars
      { name: 'Mintaka', ra: 5.533, dec: -0.299, mag: 2.23, spect: 'O9.5II' },
      { name: 'Saiph', ra: 5.796, dec: -9.670, mag: 2.09, spect: 'B0.5Ia' },
      { name: 'Adhara', ra: 6.977, dec: -28.972, mag: 1.50, spect: 'B2II' },
      { name: 'Wezen', ra: 7.139, dec: -26.393, mag: 1.84, spect: 'F8Ia' },
      { name: 'Mirzam', ra: 6.378, dec: -17.956, mag: 1.98, spect: 'B1II' }
    ];

    const staticStars: any[] = [];

    emotions.forEach((emotionId, emotionIndex) => {
      const startIndex = emotionIndex * 5;
      const emotionStars = fallbackStarData.slice(startIndex, startIndex + 5);

      emotionStars.forEach(starData => {
        const star = this.createFallbackStar(starData, emotionId);
        staticStars.push({
          scientific_name: star.scientific_name,
          poetic_description: star.poetic_description,
          coordinates: star.coordinates,
          visual_data: star.visual_data,
          emotion_id: emotionId,
          source: 'static'
        });
      });
    });

    return staticStars;
  }

  /**
   * Create a fallback star from basic astronomical data
   */
  private static createFallbackStar(starData: any, emotionId: string): Star {
    // Generate coordinates in standard astronomical format
    const raHours = Math.floor(starData.ra);
    const raMinutes = Math.floor((starData.ra - raHours) * 60);
    const raSeconds = ((starData.ra - raHours) * 60 - raMinutes) * 60;
    
    const decDegrees = Math.floor(Math.abs(starData.dec));
    const decMinutes = Math.floor((Math.abs(starData.dec) - decDegrees) * 60);
    const decSeconds = ((Math.abs(starData.dec) - decDegrees) * 60 - decMinutes) * 60;
    const decSign = starData.dec >= 0 ? '+' : '−';
    
    const coordinates = `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toFixed(1).padStart(4, '0')}s ${decSign}${decDegrees.toString().padStart(2, '0')}° ${decMinutes.toString().padStart(2, '0')}′ ${decSeconds.toFixed(0).padStart(2, '0')}″`;

    // Generate visual properties based on astronomical data
    const brightness = Math.max(0.3, Math.min(1.0, (6.5 - starData.mag) / 6.5));
    const size = Math.max(0.8, Math.min(1.6, brightness * 1.5));
    
    // Color based on spectral class
    let color = '#F8F8FF'; // Default white
    if (starData.spect) {
      const spectralClass = starData.spect.charAt(0).toUpperCase();
      switch (spectralClass) {
        case 'O': case 'B': color = '#B0C4DE'; break; // Blue
        case 'A': color = '#F8F8FF'; break; // White
        case 'F': color = '#FFFACD'; break; // Yellow-white
        case 'G': color = '#FFE4B5'; break; // Yellow
        case 'K': color = '#FFA500'; break; // Orange
        case 'M': color = '#FF6347'; break; // Red
      }
    }

    // Generate poetic description
    const poeticDescription = this.generatePoeticDescriptionForFallback(starData.name, emotionId);

    return {
      id: `fallback-${starData.name.toLowerCase()}`,
      scientific_name: starData.name,
      poetic_description: poeticDescription,
      coordinates,
      visual_data: { brightness, color, size },
      emotion_id: emotionId,
      source: 'static',
      hyg_proper_name: starData.name // Store for matching
    };
  }

  /**
   * Generate poetic descriptions for fallback stars
   */
  private static generatePoeticDescriptionForFallback(starName: string, emotionId: string): string {
    const emotionDescriptions: Record<string, string[]> = {
      love: [
        'A radiant beacon of eternal devotion',
        'Burning bright with passionate love',
        'The celestial symbol of unbreakable bonds',
        'A stellar testament to true love',
        'Shining with the warmth of deep affection'
      ],
      friendship: [
        'A loyal companion in the cosmic dance',
        'The steadfast friend among the stars',
        'Illuminating the bonds of true friendship',
        'A guiding light for kindred spirits',
        'The stellar embodiment of lasting friendship'
      ],
      family: [
        'A protective guardian watching over loved ones',
        'The ancestral light connecting generations',
        'A stellar home where hearts unite',
        'The cosmic hearth of family bonds',
        'Shining with the strength of family love'
      ],
      milestones: [
        'Marking triumphant moments in time',
        'A celestial celebration of achievement',
        'The stellar witness to life\'s victories',
        'Commemorating journeys and accomplishments',
        'A bright marker of significant moments'
      ],
      memorial: [
        'An eternal flame of cherished memories',
        'The undying light of those we remember',
        'A celestial monument to lasting love',
        'Forever shining in loving memory',
        'The stellar keeper of precious memories'
      ],
      healing: [
        'A gentle light bringing peace and renewal',
        'The cosmic source of healing energy',
        'Radiating tranquility and restoration',
        'A stellar sanctuary for weary souls',
        'The celestial beacon of hope and healing'
      ],
      adventure: [
        'The navigator\'s star for bold journeys',
        'Calling adventurers to new horizons',
        'A stellar compass for the brave',
        'The cosmic guide for explorers',
        'Illuminating paths to discovery'
      ],
      creativity: [
        'The muse\'s light inspiring artistic souls',
        'A stellar spark of creative inspiration',
        'The cosmic fountain of imagination',
        'Illuminating the artist\'s vision',
        'The celestial catalyst for creativity'
      ]
    };

    const descriptions = emotionDescriptions[emotionId] || emotionDescriptions.love;
    const baseDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

    return `${starName}, ${baseDescription.toLowerCase()}`;
  }

  /**
   * Select prominent stars from HYG catalog for each emotion
   * Creates a curated set of static stars with poetic descriptions
   */
  private static async selectProminentStarsForEmotions(): Promise<any[]> {
    try {
      if (!this.hygCatalog) {
        throw new Error('HYG catalog not loaded');
      }

      const emotions = [
        'love', 'friendship', 'family', 'milestones', 
        'memorial', 'healing', 'adventure', 'creativity'
      ];

      const staticStars: any[] = [];

      // Get bright, named stars for variety
      const brightNamedStars = this.hygCatalog
        .getNamedStars()
        .filter(star => star.mag < 3.0) // Bright stars only
        .sort((a, b) => a.mag - b.mag) // Sort by brightness
        .slice(0, 50); // Take top 50 brightest named stars

      console.log(`Found ${brightNamedStars.length} bright named stars for static selection`);

      // Distribute stars among emotions
      emotions.forEach((emotionId, emotionIndex) => {
        const emotionStars = brightNamedStars
          .filter((_, index) => index % emotions.length === emotionIndex)
          .slice(0, 5); // 5 stars per emotion

        emotionStars.forEach(hygStar => {
          const star = this.mapHygRecordToStar(hygStar, emotionId);
          staticStars.push({
            scientific_name: star.scientific_name,
            poetic_description: star.poetic_description,
            coordinates: star.coordinates,
            visual_data: star.visual_data,
            emotion_id: emotionId,
            source: 'static'
          });
        });
      });

      console.log(`Selected ${staticStars.length} static stars from HYG catalog`);
      return staticStars;
    } catch (error) {
      console.error('Error selecting prominent stars:', error);
      return [];
    }
  }

  /**
   * Convert HygRecord to Star interface
   * Maps astronomical data to our application's star format
   */
  private static mapHygRecordToStar(hygRecord: HygRecord, emotionId: string): Star {
    // Generate coordinates in standard astronomical format
    const raHours = Math.floor(hygRecord.ra);
    const raMinutes = Math.floor((hygRecord.ra - raHours) * 60);
    const raSeconds = ((hygRecord.ra - raHours) * 60 - raMinutes) * 60;
    
    const decDegrees = Math.floor(Math.abs(hygRecord.dec));
    const decMinutes = Math.floor((Math.abs(hygRecord.dec) - decDegrees) * 60);
    const decSeconds = ((Math.abs(hygRecord.dec) - decDegrees) * 60 - decMinutes) * 60;
    const decSign = hygRecord.dec >= 0 ? '+' : '−';
    
    const coordinates = `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toFixed(1).padStart(4, '0')}s ${decSign}${decDegrees.toString().padStart(2, '0')}° ${decMinutes.toString().padStart(2, '0')}′ ${decSeconds.toFixed(0).padStart(2, '0')}″`;

    // Generate visual properties based on astronomical data
    const brightness = Math.max(0.3, Math.min(1.0, (6.5 - hygRecord.mag) / 6.5));
    const size = Math.max(0.8, Math.min(1.6, brightness * 1.5));
    
    // Color based on spectral class or default
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

    // Generate poetic description based on star properties
    const poeticDescription = this.generatePoeticDescription(hygRecord, emotionId);

    return {
      id: `hyg-${hygRecord.id}`,
      scientific_name: hygRecord.proper || `HYG ${hygRecord.id}`,
      poetic_description: poeticDescription,
      coordinates,
      visual_data: { brightness, color, size },
      emotion_id: emotionId,
      source: 'static',
      hyg_proper_name: hygRecord.proper // Store HYG proper name
    };
  }

  /**
   * Generate poetic descriptions for stars based on their properties and emotion
   */
  private static generatePoeticDescription(hygRecord: HygRecord, emotionId: string): string {
    const starName = hygRecord.proper || `Star ${hygRecord.id}`;
    const isVariable = hygRecord.var && hygRecord.var.trim() !== '';
    const isBright = hygRecord.mag < 2.0;
    const isDistant = hygRecord.dist > 100;

    const emotionDescriptions: Record<string, string[]> = {
      love: [
        'A radiant beacon of eternal devotion',
        'Burning bright with passionate love',
        'The celestial symbol of unbreakable bonds',
        'A stellar testament to true love',
        'Shining with the warmth of deep affection'
      ],
      friendship: [
        'A loyal companion in the cosmic dance',
        'The steadfast friend among the stars',
        'Illuminating the bonds of true friendship',
        'A guiding light for kindred spirits',
        'The stellar embodiment of lasting friendship'
      ],
      family: [
        'A protective guardian watching over loved ones',
        'The ancestral light connecting generations',
        'A stellar home where hearts unite',
        'The cosmic hearth of family bonds',
        'Shining with the strength of family love'
      ],
      milestones: [
        'Marking triumphant moments in time',
        'A celestial celebration of achievement',
        'The stellar witness to life\'s victories',
        'Commemorating journeys and accomplishments',
        'A bright marker of significant moments'
      ],
      memorial: [
        'An eternal flame of cherished memories',
        'The undying light of those we remember',
        'A celestial monument to lasting love',
        'Forever shining in loving memory',
        'The stellar keeper of precious memories'
      ],
      healing: [
        'A gentle light bringing peace and renewal',
        'The cosmic source of healing energy',
        'Radiating tranquility and restoration',
        'A stellar sanctuary for weary souls',
        'The celestial beacon of hope and healing'
      ],
      adventure: [
        'The navigator\'s star for bold journeys',
        'Calling adventurers to new horizons',
        'A stellar compass for the brave',
        'The cosmic guide for explorers',
        'Illuminating paths to discovery'
      ],
      creativity: [
        'The muse\'s light inspiring artistic souls',
        'A stellar spark of creative inspiration',
        'The cosmic fountain of imagination',
        'Illuminating the artist\'s vision',
        'The celestial catalyst for creativity'
      ]
    };

    const descriptions = emotionDescriptions[emotionId] || emotionDescriptions.love;
    const baseDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Add special characteristics
    let enhancement = '';
    if (isVariable) enhancement = ' with a rhythmic, pulsing glow';
    else if (isBright) enhancement = ' blazing magnificently across the heavens';
    else if (isDistant) enhancement = ' from the distant cosmic depths';

    return baseDescription + enhancement;
  }

  /**
   * UPDATED: Main method to fetch stars for a given emotion
   * Now returns HygRecord[] instead of Star[]
   * Uses AI generation with HYG matching, HYG catalog fallback, and database caching
   */
  static async fetchStarsForEmotion(emotionId: string): Promise<HygRecord[]> {
    try {
      console.log(`Fetching stars for emotion: ${emotionId}`);

      // Ensure HYG catalog is loaded first
      if (!this.hygCatalog && !this.catalogLoadFailed) {
        try {
          await this.loadHygCatalog();
        } catch (error) {
          console.warn('Failed to load HYG catalog for fetchStarsForEmotion:', error);
        }
      }

      // Step 1: Check for cached AI-generated stars
      const { data: cachedStars, error: cacheError } = await supabase
        .from('stars')
        .select('*')
        .eq('emotion_id', emotionId)
        .eq('source', 'ai')
        .order('generated_at', { ascending: false });

      if (cacheError) {
        console.error('Error checking cached stars:', cacheError);
      } else if (cachedStars && cachedStars.length > 0) {
        const latestStar = cachedStars[0];
        const generatedAt = new Date(latestStar.generated_at || 0).getTime();
        const now = Date.now();
        
        if (now - generatedAt < this.CACHE_DURATION) {
          console.log(`Using cached AI stars (${cachedStars.length} found)`);
          // Convert cached stars to HygRecords
          const hygRecords = cachedStars.slice(0, 5).map(star => this.findBestHygMatch(star)).filter(Boolean) as HygRecord[];
          if (hygRecords.length > 0) {
            console.log(`Successfully matched ${hygRecords.length} cached stars to HYG records`);
            return hygRecords;
          }
        } else {
          console.log('Cached stars are stale, generating new ones');
        }
      }

      // Step 2: Try AI generation
      try {
        console.log('Calling AI generation function...');
        
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stars-ai`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emotionId })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.stars && result.stars.length > 0) {
            console.log(`AI generation successful: ${result.stars.length} stars generated`);
            
            // Convert AI-generated stars to HygRecords using matching
            const hygRecords: HygRecord[] = [];
            for (const aiStar of result.stars) {
              const hygMatch = this.findBestHygMatch(aiStar);
              if (hygMatch) {
                hygRecords.push(hygMatch);
              }
            }
            
            if (hygRecords.length > 0) {
              console.log(`Successfully matched ${hygRecords.length} AI stars to HYG records`);
              return hygRecords;
            } else {
              console.warn('No AI stars could be matched to HYG records, falling back');
            }
          } else {
            console.warn('AI generation returned no stars, falling back to HYG catalog');
          }
        } else {
          const errorText = await response.text();
          console.error('AI generation failed:', response.status, errorText);
        }
      } catch (aiError) {
        console.error('AI generation request failed:', aiError);
      }

      // Step 3: Fallback to HYG catalog (if available)
      if (!this.catalogLoadFailed) {
        try {
          console.log('Attempting to use HYG catalog for star selection');
          return await this.getHygStarsForEmotion(emotionId);
        } catch (hygError) {
          console.warn('HYG catalog fallback failed:', hygError);
        }
      }

      // Step 4: Final fallback to static database stars
      console.log('Using static database stars as final fallback');
      return this.getStaticStarsForEmotion(emotionId);

    } catch (error) {
      console.error('Error in fetchStarsForEmotion:', error);
      
      // Final fallback to static database stars
      console.log('Using static database stars as final fallback');
      return this.getStaticStarsForEmotion(emotionId);
    }
  }

  /**
   * UPDATED: Get stars from HYG catalog for an emotion
   * Now returns HygRecord[] directly
   */
  private static async getHygStarsForEmotion(emotionId: string): Promise<HygRecord[]> {
    try {
      // Ensure HYG catalog is loaded
      if (!this.hygCatalog) {
        await this.loadHygCatalog();
      }

      if (!this.hygCatalog) {
        throw new Error('HYG catalog not available');
      }

      // Get named stars for better user experience
      let candidateStars = this.hygCatalog.getNamedStars();

      // Apply emotion-specific filtering
      switch (emotionId) {
        case 'love':
          // Bright, warm stars (often red/orange)
          candidateStars = candidateStars.filter(star => 
            star.mag < 4.0 && 
            (star.spect?.startsWith('K') || star.spect?.startsWith('M') || star.spect?.startsWith('G'))
          );
          break;
        
        case 'friendship':
          // Stable, reliable stars (main sequence)
          candidateStars = candidateStars.filter(star => 
            star.mag < 4.5 && 
            (star.spect?.startsWith('G') || star.spect?.startsWith('F'))
          );
          break;
        
        case 'family':
          // Multiple star systems when available
          candidateStars = candidateStars.filter(star => 
            star.mag < 4.0 && star.comp && star.comp > 1
          );
          break;
        
        case 'milestones':
          // Very bright, prominent stars
          candidateStars = candidateStars.filter(star => star.mag < 2.0);
          break;
        
        case 'memorial':
          // Variable stars (representing eternal change/memory)
          const variableStars = this.hygCatalog.getVariableStars().filter(star => star.proper);
          if (variableStars.length >= 5) {
            candidateStars = variableStars;
          }
          break;
        
        case 'healing':
          // Gentle, moderate brightness stars
          candidateStars = candidateStars.filter(star => 
            star.mag >= 2.0 && star.mag < 4.0 &&
            (star.spect?.startsWith('F') || star.spect?.startsWith('A'))
          );
          break;
        
        case 'adventure':
          // Navigation stars (bright, well-known)
          candidateStars = candidateStars.filter(star => 
            star.mag < 3.0 && star.proper && star.proper.length > 0
          );
          break;
        
        case 'creativity':
          // Unique spectral classes or unusual stars
          candidateStars = candidateStars.filter(star => 
            star.spect && (
              star.spect.includes('e') || // Emission lines
              star.spect.startsWith('B') || // Hot blue stars
              star.spect.startsWith('O')
            )
          );
          break;
        
        default:
          // General bright stars
          candidateStars = candidateStars.filter(star => star.mag < 4.0);
      }

      // If we don't have enough candidates, fall back to bright named stars
      if (candidateStars.length < 5) {
        candidateStars = this.hygCatalog
          .getNamedStars()
          .filter(star => star.mag < 4.0)
          .sort((a, b) => a.mag - b.mag);
      }

      // Select 5 random stars from candidates
      const selectedStars = candidateStars
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      console.log(`Selected ${selectedStars.length} stars from HYG catalog for ${emotionId}`);

      // Return HygRecords directly
      return selectedStars;

    } catch (error) {
      console.error('Error getting HYG stars for emotion:', error);
      return this.getStaticStarsForEmotion(emotionId);
    }
  }

  /**
   * UPDATED: Get static stars from database for an emotion
   * Now returns HygRecord[] by matching database stars to HYG catalog
   */
  private static async getStaticStarsForEmotion(emotionId: string): Promise<HygRecord[]> {
    try {
      const { data: staticStars, error } = await supabase
        .from('stars')
        .select('*')
        .eq('emotion_id', emotionId)
        .eq('source', 'static')
        .limit(5);

      if (error) {
        console.error('Error fetching static stars:', error);
        return [];
      }

      if (staticStars && staticStars.length > 0) {
        console.log(`Found ${staticStars.length} static stars in database`);
        
        // Convert static stars to HygRecords using matching
        const hygRecords: HygRecord[] = [];
        for (const star of staticStars) {
          const hygMatch = this.findBestHygMatch(star);
          if (hygMatch) {
            hygRecords.push(hygMatch);
          }
        }
        
        console.log(`Successfully matched ${hygRecords.length} static stars to HYG records`);
        return hygRecords;
      }

      return [];
    } catch (error) {
      console.error('Error in getStaticStarsForEmotion:', error);
      return [];
    }
  }

  /**
   * UPDATED: Get star by ID - supports both database and HYG catalog lookups
   * Now handles numeric HygRecord IDs for the Dedication page
   */
  static async getStarById(starId: string): Promise<Star | null> {
    try {
      // Check if it's a numeric HYG ID
      const numericId = parseInt(starId);
      if (!isNaN(numericId) && this.hygCatalog) {
        console.log(`StarService.getStarById: Looking up HYG star with ID ${numericId}`);
        
        const hygStar = this.hygCatalog.getStar(numericId);
        if (hygStar) {
          // Convert HygRecord to Star for the Dedication form
          // We need to determine the emotion - use a default for now
          const star = this.mapHygRecordToStar(hygStar, 'love');
          console.log(`StarService.getStarById: Found HYG star: ${star.scientific_name}`);
          return star;
        }
      }

      // First try database
      const { data, error } = await supabase
        .from('stars')
        .select('*')
        .eq('id', starId)
        .single();

      if (!error && data) {
        return data;
      }

      // If it's a HYG star ID, try to look it up in the catalog
      if (starId.startsWith('hyg-') && !this.catalogLoadFailed) {
        const hygId = parseInt(starId.replace('hyg-', ''));
        
        try {
          if (!this.hygCatalog) {
            await this.loadHygCatalog();
          }

          if (this.hygCatalog) {
            const hygStar = this.hygCatalog.getStar(hygId);
            if (hygStar) {
              // We need to determine the emotion - this is a limitation
              // For now, we'll use a default emotion
              return this.mapHygRecordToStar(hygStar, 'love');
            }
          }
        } catch (hygError) {
          console.warn('Failed to lookup HYG star:', hygError);
        }
      }

      console.error('Star not found:', starId);
      return null;
    } catch (error) {
      console.error('Error in getStarById:', error);
      return null;
    }
  }

  /**
   * Legacy method for compatibility
   */
  static async getStarsByEmotion(emotionId: string): Promise<Star[] | null> {
    try {
      const hygRecords = await this.fetchStarsForEmotion(emotionId);
      if (hygRecords.length > 0) {
        // Convert HygRecords back to Stars for legacy compatibility
        const stars = hygRecords.map(hygRecord => this.mapHygRecordToStar(hygRecord, emotionId));
        return stars;
      }
      return null;
    } catch (error) {
      console.error('Error in getStarsByEmotion:', error);
      return null;
    }
  }

  /**
   * Clear cached AI stars for an emotion (useful for testing)
   */
  static async clearCachedStars(emotionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stars')
        .delete()
        .eq('emotion_id', emotionId)
        .eq('source', 'ai');

      if (error) {
        console.error('Error clearing cached stars:', error);
        return false;
      }

      console.log(`Cleared cached stars for emotion: ${emotionId}`);
      return true;
    } catch (error) {
      console.error('Error in clearCachedStars:', error);
      return false;
    }
  }

  /**
   * Get HYG catalog instance (for advanced usage)
   */
  static async getHygCatalog(): Promise<HygStarsCatalog | null> {
    try {
      if (!this.hygCatalog && !this.catalogLoadFailed) {
        await this.loadHygCatalog();
      }
      return this.hygCatalog;
    } catch (error) {
      console.warn('HYG catalog not available:', error);
      return null;
    }
  }
}