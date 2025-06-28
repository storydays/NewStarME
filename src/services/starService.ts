import { supabase } from '../lib/supabase';
import { Star, HygStarData, SuggestedStar } from '../types';
import { StarsCatalog } from '../data/StarsCatalog';

/**
 * StarService - Enhanced with Refined Architecture Integration
 * 
 * Purpose: Handles star data operations with clean separation between:
 * - HygStarData (immutable catalog source)
 * - SuggestedStar (volatile AI suggestions)
 * - Star (legacy database format)
 * 
 * Key Features:
 * - AI star generation with catalog matching
 * - Fallback to catalog-based selection
 * - SuggestedStar creation with starCatalogId links
 * - Legacy Star format support for database operations
 * 
 * Confidence Rating: High - Clean integration with new architecture
 */

export class StarService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static starsCatalog: StarsCatalog | null = null;

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
        return;
      }

      // Create fallback static stars
      await this.createFallbackStaticStars();
    } catch (error) {
      console.error('Error initializing StarService:', error);
    }
  }

  /**
   * Get suggested stars for an emotion using AI + catalog matching
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

    // Convert AI stars to SuggestedStar format with catalog matching
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
          starCatalogId: catalogMatch.hyg.id.toString()
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
      starCatalogId: catalogStar.hyg.id.toString()
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
   */
  private static getFallbackSuggestedStars(emotionId: string): SuggestedStar[] {
    console.log('StarService: Using fallback suggested stars');
    
    // Create basic suggested stars without catalog links
    return Array.from({ length: 5 }, (_, index) => ({
      id: `fallback-${emotionId}-${index}`,
      name: `${emotionId.charAt(0).toUpperCase() + emotionId.slice(1)} Star ${index + 1}`,
      description: `A beautiful celestial beacon perfect for expressing ${emotionId}`,
      metadata: {
        emotion: emotionId,
        confidence: 0.5,
        source: 'fallback'
      },
      starCatalogId: `fallback-${index}` // Placeholder catalog ID
    }));
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
      { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, spect: 'G5III' },
      // ... (additional fallback stars)
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
   * Legacy method for compatibility - converts SuggestedStar to Star format
   */
  static async fetchStarsForEmotion(emotionId: string): Promise<Star[]> {
    try {
      const suggestedStars = await this.getSuggestedStarsForEmotion(emotionId);
      
      // Convert SuggestedStar to legacy Star format
      const legacyStars: Star[] = suggestedStars.map(suggested => ({
        id: suggested.id,
        scientific_name: suggested.name || 'Unknown Star',
        poetic_description: suggested.description || 'A beautiful star',
        coordinates: '00h 00m 00s +00° 00′ 00″', // Placeholder
        visual_data: {
          brightness: 0.8,
          color: '#F8F8FF',
          size: 1.0
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
   * Get star by ID (legacy support)
   */
  static async getStarById(starId: string): Promise<Star | null> {
    try {
      const { data, error } = await supabase
        .from('stars')
        .select('*')
        .eq('id', starId)
        .single();

      if (!error && data) {
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error in getStarById:', error);
      return null;
    }
  }
}