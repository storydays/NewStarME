import { supabase } from '../lib/supabase';
import { Star, HygStarData, SuggestedStar } from '../types';
import { StarsCatalog } from '../data/StarsCatalog';
import { HygStarsCatalog } from '../data/HygStarsCatalog';

/**
 * StarService - AI Integration and Data Transformation Layer
 * 
 * Purpose: Handles star data operations with clean separation between:
 * - HygStarData (immutable catalog source)
 * - SuggestedStar (volatile AI suggestions with direct catalog references)
 * - Star (legacy database format)
 * 
 * UPDATED: SuggestedStar now contains starCatalogRef (direct HygStarData reference)
 * instead of starCatalogId (string reference)
 * 
 * Key Features:
 * - AI star generation with catalog matching
 * - Fallback to catalog-based selection
 * - SuggestedStar creation with direct starCatalogRef links
 * - Legacy Star format support for database operations
 * - Uses StarsCatalog as single source of truth
 * 
 * Confidence Rating: High - Enhanced with direct catalog references
 */

export class StarService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static starsCatalog: StarsCatalog | null = null;
  private static hygCatalog: HygStarsCatalog | null = null;
  private static catalogLoadPromise: Promise<HygStarsCatalog> | null = null;
  private static catalogLoadFailed: boolean = false;

  /**
   * Set the StarsCatalog instance for use by the service
   */
  static setStarsCatalog(catalog: StarsCatalog): void {
    this.starsCatalog = catalog;
    console.log('StarService: StarsCatalog instance set');
  }

  /**
   * Initialize the StarService with fallback static stars
   */
  static async initializeStars() {
    try {
      console.log('StarService: Initializing...');
      
      // Check if static stars already exist in database
      const { data: existingStars } = await supabase
        .from('stars')
        .select('id')
        .eq('source', 'static')
        .limit(1);

      if (existingStars && existingStars.length > 0) {
        console.log('StarService: Static stars already initialized in database');
        
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
          // ⚠️ DO NOT EVER CHANGE THE `compressed` FLAG BELOW.
          // The file has a `.csv.gz` extension, but the browser automatically decompresses it
          // when the `Content-Encoding: gzip` header is present.
          // Setting `compressed: true` would result in attempting to decompress an already decompressed file,
          // causing corrupted data or runtime failure.
          // This has been explicitly confirmed. NEVER SUGGEST OR ATTEMPT TO CHANGE THIS AGAIN.
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
   * Get suggested stars for an emotion using AI + catalog matching
   * UPDATED: Returns SuggestedStar with direct starCatalogRef
   */
  static async getSuggestedStarsForEmotion(emotionId: string): Promise<SuggestedStar[]> {
    try {
      console.log(`StarService: Getting suggested stars for emotion: ${emotionId}`);

      if (!this.starsCatalog) {
        console.warn('StarService: No StarsCatalog available, using fallback');
        return this.getFallbackSuggestedStars(emotionId);
      }

      // Step 1: Try AI generation
      try {
        const aiSuggestedStars = await this.generateAISuggestedStars(emotionId);
        if (aiSuggestedStars.length > 0) {
          console.log(`StarService: AI generated ${aiSuggestedStars.length} suggested stars`);
          return aiSuggestedStars;
        }
      } catch (aiError) {
        console.warn('StarService: AI generation failed, falling back to catalog:', aiError);
      }

      // Step 2: Fallback to catalog-based selection
      return this.getCatalogBasedSuggestedStars(emotionId);

    } catch (error) {
      console.error('Error in getSuggestedStarsForEmotion:', error);
      return this.getFallbackSuggestedStars(emotionId);
    }
  }

  /**
   * Generate AI-based suggested stars with catalog matching
   * UPDATED: Creates SuggestedStar with direct starCatalogRef
   */
  private static async generateAISuggestedStars(emotionId: string): Promise<SuggestedStar[]> {
    console.log('StarService: Attempting AI star generation...');

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stars-ai`;
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emotionId })
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.stars || result.stars.length === 0) {
      throw new Error('AI generation returned no stars');
    }

    // Convert AI stars to SuggestedStar format with direct catalog references
    const suggestedStars: SuggestedStar[] = [];

    for (const aiStar of result.stars) {
      const catalogMatch = this.findCatalogMatchForAIStar(aiStar);
      
      if (catalogMatch) {
        const suggestedStar: SuggestedStar = {
          id: `ai-${aiStar.id}`,
          name: aiStar.scientific_name,
          description: aiStar.poetic_description,
          metadata: {
            emotion: emotionId,
            confidence: 0.9,
            source: 'ai',
            generated_at: aiStar.generated_at
          },
          starCatalogRef: catalogMatch // CHANGED: Direct reference instead of ID
        };
        
        suggestedStars.push(suggestedStar);
      }
    }

    console.log(`StarService: Matched ${suggestedStars.length} AI stars to catalog`);
    return suggestedStars;
  }

  /**
   * Find catalog match for AI-generated star
   */
  private static findCatalogMatchForAIStar(aiStar: Star): HygStarData | null {
    if (!this.starsCatalog) return null;

    // Try to find by name first
    const namedStars = this.starsCatalog.searchStarsByName(aiStar.scientific_name);
    if (namedStars.length > 0) {
      return namedStars[0];
    }

    // Fallback to random bright star
    const brightStars = this.starsCatalog.getStarsByMagnitude(-2, 3);
    if (brightStars.length > 0) {
      return brightStars[Math.floor(Math.random() * brightStars.length)];
    }

    return null;
  }

  /**
   * Get catalog-based suggested stars
   * UPDATED: Creates SuggestedStar with direct starCatalogRef
   */
  private static getCatalogBasedSuggestedStars(emotionId: string): SuggestedStar[] {
    if (!this.starsCatalog) {
      return this.getFallbackSuggestedStars(emotionId);
    }

    console.log('StarService: Using catalog-based star selection');
    
    const catalogStars = this.starsCatalog.getStarsForEmotion(emotionId, 5);
    
    return catalogStars.map((catalogStar, index) => ({
      id: `catalog-${catalogStar.hyg.id}`,
      name: catalogStar.hyg.proper || `HYG ${catalogStar.hyg.id}`,
      description: this.generatePoeticDescription(catalogStar, emotionId),
      metadata: {
        emotion: emotionId,
        confidence: 0.8,
        source: 'catalog',
        magnitude: catalogStar.hyg.mag,
        spectralClass: catalogStar.hyg.spect
      },
      starCatalogRef: catalogStar // CHANGED: Direct reference instead of ID
    }));
  }

  /**
   * Generate poetic description for catalog star
   */
  private static generatePoeticDescription(catalogStar: HygStarData, emotionId: string): string {
    const starName = catalogStar.hyg.proper || `Star ${catalogStar.hyg.id}`;
    const isVariable = catalogStar.hyg.var && catalogStar.hyg.var.trim() !== '';
    const isBright = catalogStar.hyg.mag < 2.0;
    const isDistant = catalogStar.hyg.dist > 100;

    const emotionDescriptions: Record<string, string[]> = {
      love: [
        'A radiant beacon of eternal devotion',
        'Burning bright with passionate love',
        'The celestial symbol of unbreakable bonds'
      ],
      friendship: [
        'A loyal companion in the cosmic dance',
        'The steadfast friend among the stars',
        'Illuminating the bonds of true friendship'
      ],
      family: [
        'A protective guardian watching over loved ones',
        'The ancestral light connecting generations',
        'A stellar home where hearts unite'
      ],
      milestones: [
        'Marking triumphant moments in time',
        'A celestial celebration of achievement',
        'The stellar witness to life\'s victories'
      ],
      memorial: [
        'An eternal flame of cherished memories',
        'The undying light of those we remember',
        'A celestial monument to lasting love'
      ],
      healing: [
        'A gentle light bringing peace and renewal',
        'The cosmic source of healing energy',
        'Radiating tranquility and restoration'
      ],
      adventure: [
        'The navigator\'s star for bold journeys',
        'Calling adventurers to new horizons',
        'A stellar compass for the brave'
      ],
      creativity: [
        'The muse\'s light inspiring artistic souls',
        'A stellar spark of creative inspiration',
        'The cosmic fountain of imagination'
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
   * Fallback suggested stars when catalog is not available
   * UPDATED: Creates placeholder SuggestedStar with minimal starCatalogRef
   */
  private static getFallbackSuggestedStars(emotionId: string): SuggestedStar[] {
    console.log('StarService: Using fallback suggested stars');
    
    // Create basic suggested stars with placeholder catalog references
    return Array.from({ length: 5 }, (_, index) => {
      // Create a minimal HygStarData for fallback
      const fallbackCatalogRef: HygStarData = {
        hyg: {
          id: index + 1,
          ra: Math.random() * 360,
          dec: (Math.random() - 0.5) * 180,
          dist: Math.random() * 100 + 10,
          mag: Math.random() * 6,
          absmag: Math.random() * 10,
          x: Math.random() * 20 - 10,
          y: Math.random() * 20 - 10,
          z: Math.random() * 20 - 10,
          rarad: Math.random() * 2 * Math.PI,
          decrad: (Math.random() - 0.5) * Math.PI,
          proper: `${emotionId.charAt(0).toUpperCase() + emotionId.slice(1)} Star ${index + 1}`
        },
        render: {
          color: '#F8F8FF',
          size: 1.0,
          brightness: 0.8,
          position: [
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
          ] as [number, number, number]
        }
      };

      return {
        id: `fallback-${emotionId}-${index}`,
        name: `${emotionId.charAt(0).toUpperCase() + emotionId.slice(1)} Star ${index + 1}`,
        description: `A beautiful celestial beacon perfect for expressing ${emotionId}`,
        metadata: {
          emotion: emotionId,
          confidence: 0.5,
          source: 'fallback'
        },
        starCatalogRef: fallbackCatalogRef // CHANGED: Direct reference instead of ID
      };
    });
  }

  /**
   * Create fallback static stars in database
   */
  private static async createFallbackStaticStars(): Promise<void> {
    try {
      console.log('StarService: Creating fallback static stars...');
      
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
   * Generate fallback stars for database
   */
  private static generateFallbackStars(): any[] {
    const emotions = [
      'love', 'friendship', 'family', 'milestones', 
      'memorial', 'healing', 'adventure', 'creativity'
    ];

    const fallbackStarData = [
      { name: 'Vega', ra: 18.615, dec: 38.784, mag: 0.03, spect: 'A0V' },
      { name: 'Altair', ra: 19.846, dec: 8.868, mag: 0.77, spect: 'A7V' },
      { name: 'Deneb', ra: 20.690, dec: 45.280, mag: 1.25, spect: 'A2Ia' },
      { name: 'Arcturus', ra: 14.261, dec: 19.182, mag: -0.05, spect: 'K1.5III' },
      { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, spect: 'G5III' }
    ];

    const staticStars: any[] = [];

    emotions.forEach((emotionId, emotionIndex) => {
      const startIndex = emotionIndex % fallbackStarData.length;
      const emotionStars = fallbackStarData.slice(startIndex, startIndex + 1);

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
   * Create a fallback star from basic data
   */
  private static createFallbackStar(starData: any, emotionId: string): Star {
    // Generate coordinates
    const raHours = Math.floor(starData.ra);
    const raMinutes = Math.floor((starData.ra - raHours) * 60);
    const raSeconds = ((starData.ra - raHours) * 60 - raMinutes) * 60;
    
    const decDegrees = Math.floor(Math.abs(starData.dec));
    const decMinutes = Math.floor((Math.abs(starData.dec) - decDegrees) * 60);
    const decSeconds = ((Math.abs(starData.dec) - decDegrees) * 60 - decMinutes) * 60;
    const decSign = starData.dec >= 0 ? '+' : '−';
    
    const coordinates = `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toFixed(1).padStart(4, '0')}s ${decSign}${decDegrees.toString().padStart(2, '0')}° ${decMinutes.toString().padStart(2, '0')}′ ${decSeconds.toFixed(0).padStart(2, '0')}″`;

    // Generate visual properties
    const brightness = Math.max(0.3, Math.min(1.0, (6.5 - starData.mag) / 6.5));
    const size = Math.max(0.8, Math.min(1.6, brightness * 1.5));
    
    // Color based on spectral class
    let color = '#F8F8FF';
    if (starData.spect) {
      const spectralClass = starData.spect.charAt(0).toUpperCase();
      switch (spectralClass) {
        case 'O': case 'B': color = '#B0C4DE'; break;
        case 'A': color = '#F8F8FF'; break;
        case 'F': color = '#FFFACD'; break;
        case 'G': color = '#FFE4B5'; break;
        case 'K': color = '#FFA500'; break;
        case 'M': color = '#FF6347'; break;
      }
    }

    return {
      id: `fallback-${starData.name.toLowerCase()}`,
      scientific_name: starData.name,
      poetic_description: `${starData.name}, a beautiful celestial beacon perfect for expressing ${emotionId}`,
      coordinates,
      visual_data: { brightness, color, size },
      emotion_id: emotionId,
      source: 'static'
    };
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
  private static mapHygRecordToStar(hygRecord: any, emotionId: string): Star {
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
    const poeticDescription = this.generatePoeticDescriptionForFallback(hygRecord.proper || `HYG ${hygRecord.id}`, emotionId);

    return {
      id: `hyg-${hygRecord.id}`,
      scientific_name: hygRecord.proper || `HYG ${hygRecord.id}`,
      poetic_description: poeticDescription,
      coordinates,
      visual_data: { brightness, color, size },
      emotion_id: emotionId,
      source: 'static'
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
   * Legacy method for compatibility - converts SuggestedStar to Star format
   * UPDATED: Uses starCatalogRef instead of starCatalogId
   */
  static async fetchStarsForEmotion(emotionId: string): Promise<Star[]> {
    try {
      const suggestedStars = await this.getSuggestedStarsForEmotion(emotionId);
      
      // Convert SuggestedStar to legacy Star format using starCatalogRef
      const legacyStars: Star[] = suggestedStars.map(suggested => ({
        id: suggested.id,
        scientific_name: suggested.name || suggested.starCatalogRef.hyg.proper || 'Unknown Star',
        poetic_description: suggested.description || 'A beautiful star',
        coordinates: `${suggested.starCatalogRef.hyg.ra.toFixed(3)}° ${suggested.starCatalogRef.hyg.dec.toFixed(3)}°`,
        visual_data: {
          brightness: suggested.starCatalogRef.render.brightness,
          color: suggested.starCatalogRef.render.color,
          size: suggested.starCatalogRef.render.size
        },
        emotion_id: emotionId,
        source: 'ai'
      }));

      return legacyStars;
    } catch (error) {
      console.error('Error in fetchStarsForEmotion:', error);
      return [];
    }
  }

  /**
   * Format HYG coordinates for database queries
   */
  private static formatHygCoordinates(hygRecord: any): string {
    const raHours = Math.floor(hygRecord.ra);
    const raMinutes = Math.floor((hygRecord.ra - raHours) * 60);
    const raSeconds = ((hygRecord.ra - raHours) * 60 - raMinutes) * 60;
    
    const decDegrees = Math.floor(Math.abs(hygRecord.dec));
    const decMinutes = Math.floor((Math.abs(hygRecord.dec) - decDegrees) * 60);
    const decSeconds = ((Math.abs(hygRecord.dec) - decDegrees) * 60 - decMinutes) * 60;
    const decSign = hygRecord.dec >= 0 ? '+' : '−';
    
    return `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toFixed(1).padStart(4, '0')}s ${decSign}${decDegrees.toString().padStart(2, '0')}° ${decMinutes.toString().padStart(2, '0')}′ ${decSeconds.toFixed(0).padStart(2, '0')}″`;
  }

  /**
   * Get star by ID (legacy support)
   * FIXED: Handle catalog-prefixed IDs properly to avoid UUID errors
   */
  static async getStarById(starId: string): Promise<Star | null> {
    try {
      // Handle catalog-prefixed IDs first (before attempting database query)
      if (starId.startsWith('catalog-') && this.starsCatalog) {
        const catalogId = parseInt(starId.replace('catalog-', ''));
        const catalogStar = this.starsCatalog.getStarById(catalogId);
        
        if (catalogStar) {
          // Try to find matching star in database using scientific name and coordinates
          const formattedCoordinates = this.formatHygCoordinates(catalogStar.hyg);
          const starName = catalogStar.hyg.proper || `HYG ${catalogStar.hyg.id}`;
          
          const { data: dbStar, error } = await supabase
            .from('stars')
            .select('*')
            .eq('scientific_name', starName)
            .eq('coordinates', formattedCoordinates)
            .single();

          if (!error && dbStar) {
            return dbStar;
          }

          // If not found in database, return catalog star in legacy format
          return {
            id: starId,
            scientific_name: starName,
            poetic_description: 'A magnificent star from the cosmic catalog',
            coordinates: formattedCoordinates,
            visual_data: {
              brightness: catalogStar.render.brightness,
              color: catalogStar.render.color,
              size: catalogStar.render.size
            },
            emotion_id: 'unknown',
            source: 'catalog'
          };
        }
      }

      // Only attempt database query with UUID-like IDs (not prefixed IDs)
      if (!starId.includes('-') || starId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data, error } = await supabase
          .from('stars')
          .select('*')
          .eq('id', starId)
          .single();

        if (!error && data) {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in getStarById:', error);
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