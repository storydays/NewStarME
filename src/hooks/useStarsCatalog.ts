import { useState, useEffect, useRef } from 'react';
import { HygStarsCatalog } from '../data/HygStarsCatalog';
import { StarsCatalog } from '../data/StarsCatalog';
import { HygStarData } from '../types';

/**
 * useStarsCatalog Hook - Central Star Catalog Management
 * 
 * Purpose: Provides access to the central StarsCatalog throughout the application.
 * This hook manages the loading and initialization of the star catalog.
 * 
 * Features:
 * - Loads and initializes the HYG catalog
 * - Provides the enriched StarsCatalog instance
 * - Manages loading and error states
 * - Singleton pattern to ensure single catalog instance
 * 
 * Confidence Rating: High - Central catalog management
 */

interface UseStarsCatalogReturn {
  catalog: StarsCatalog | null;
  loading: boolean;
  error: string | null;
  totalStars: number;
}

// Singleton pattern for catalog instance
let catalogInstance: StarsCatalog | null = null;
let catalogPromise: Promise<StarsCatalog> | null = null;

export function useStarsCatalog(): UseStarsCatalogReturn {
  const [catalog, setCatalog] = useState<StarsCatalog | null>(catalogInstance);
  const [loading, setLoading] = useState(!catalogInstance);
  const [error, setError] = useState<string | null>(null);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    async function initializeCatalog() {
      // Return existing instance if available
      if (catalogInstance) {
        setCatalog(catalogInstance);
        setTotalStars(catalogInstance.getTotalStars());
        setLoading(false);
        return;
      }

      // Return existing promise if loading
      if (catalogPromise) {
        try {
          const catalog = await catalogPromise;
          setCatalog(catalog);
          setTotalStars(catalog.getTotalStars());
          setLoading(false);
        } catch (err) {
          console.error('Error waiting for catalog promise:', err);
          setError(err instanceof Error ? err.message : 'Failed to load catalog');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('useStarsCatalog: Initializing star catalog...');

        // Create the loading promise
        catalogPromise = (async () => {
          // FIXED: Changed compressed flag from true to false to handle uncompressed file
          const hygCatalog = await HygStarsCatalog.fromUrl('/hygdata_v41.csv.gz', false);
          
          // Create enriched catalog
          const starsCatalog = await StarsCatalog.fromHygCatalog(hygCatalog);
          
          // Cache the instance
          catalogInstance = starsCatalog;
          
          return starsCatalog;
        })();

        const starsCatalog = await catalogPromise;
        
        setCatalog(starsCatalog);
        setTotalStars(starsCatalog.getTotalStars());
        console.log(`useStarsCatalog: Catalog initialized with ${starsCatalog.getTotalStars()} stars`);

      } catch (err) {
        console.error('Error initializing star catalog:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load star catalog';
        setError(errorMessage);
        
        // Clear the failed promise
        catalogPromise = null;
      } finally {
        setLoading(false);
      }
    }

    initializeCatalog();
  }, []);

  return {
    catalog,
    loading,
    error,
    totalStars
  };
}

/**
 * useStarsForEmotion Hook - Get stars for a specific emotion
 * 
 * Purpose: Provides emotion-specific star selection using the central catalog.
 */
export function useStarsForEmotion(emotionId?: string, count: number = 5) {
  const { catalog, loading: catalogLoading, error: catalogError } = useStarsCatalog();
  const [stars, setStars] = useState<HygStarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emotionId) {
      setStars([]);
      setLoading(false);
      return;
    }

    if (catalogLoading) {
      setLoading(true);
      return;
    }

    if (catalogError) {
      setError(catalogError);
      setLoading(false);
      return;
    }

    if (!catalog) {
      setError('Star catalog not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`useStarsForEmotion: Getting stars for emotion: ${emotionId}`);
      const emotionStars = catalog.getStarsForEmotion(emotionId, count);
      
      setStars(emotionStars);
      console.log(`useStarsForEmotion: Found ${emotionStars.length} stars for ${emotionId}`);

    } catch (err) {
      console.error('Error getting stars for emotion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stars for emotion';
      setError(errorMessage);
      setStars([]);
    } finally {
      setLoading(false);
    }
  }, [emotionId, count, catalog, catalogLoading, catalogError]);

  return {
    stars,
    loading: loading || catalogLoading,
    error: error || catalogError
  };
}

export default useStarsCatalog;