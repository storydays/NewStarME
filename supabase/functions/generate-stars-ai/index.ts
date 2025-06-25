import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Full star catalog for coordinate lookup
const fullStarCatalog = [
  { scientific_name: 'Sirius', coordinates: '06h 45m 08.9s −16° 42′ 58″', visual_data: { brightness: 1.0, color: '#87CEEB', size: 1.4 } },
  { scientific_name: 'Canopus', coordinates: '06h 23m 57.1s −52° 41′ 44″', visual_data: { brightness: 0.95, color: '#FFFACD', size: 1.3 } },
  { scientific_name: 'Arcturus', coordinates: '14h 15m 39.7s +19° 10′ 57″', visual_data: { brightness: 0.85, color: '#FF7F50', size: 1.3 } },
  { scientific_name: 'Vega', coordinates: '18h 36m 56.3s +38° 47′ 01″', visual_data: { brightness: 0.8, color: '#F8F8FF', size: 1.0 } },
  { scientific_name: 'Capella', coordinates: '05h 16m 41.4s +45° 59′ 53″', visual_data: { brightness: 0.7, color: '#FFE4B5', size: 1.1 } },
  { scientific_name: 'Rigel', coordinates: '05h 14m 32.3s −08° 12′ 06″', visual_data: { brightness: 0.9, color: '#B0C4DE', size: 1.35 } },
  { scientific_name: 'Procyon', coordinates: '07h 39m 18.1s +05° 13′ 30″', visual_data: { brightness: 0.68, color: '#FFFAF0', size: 1.1 } },
  { scientific_name: 'Betelgeuse', coordinates: '05h 55m 10.3s +07° 24′ 25″', visual_data: { brightness: 0.8, color: '#FFA500', size: 1.5 } },
  { scientific_name: 'Achernar', coordinates: '01h 37m 42.8s −57° 14′ 12″', visual_data: { brightness: 0.76, color: '#E6E6FA', size: 1.2 } },
  { scientific_name: 'Hadar', coordinates: '14h 03m 49.4s −60° 22′ 23″', visual_data: { brightness: 0.82, color: '#B0E0E6', size: 1.25 } },
  { scientific_name: 'Altair', coordinates: '19h 50m 47.0s +08° 52′ 06″', visual_data: { brightness: 0.7, color: '#F0F8FF', size: 1.05 } },
  { scientific_name: 'Acrux', coordinates: '12h 26m 35.9s −63° 05′ 57″', visual_data: { brightness: 0.79, color: '#E0E0E0', size: 1.1 } },
  { scientific_name: 'Aldebaran', coordinates: '04h 35m 55.2s +16° 30′ 33″', visual_data: { brightness: 0.75, color: '#FF6347', size: 1.15 } },
  { scientific_name: 'Antares', coordinates: '16h 29m 24.5s −26° 25′ 55″', visual_data: { brightness: 0.77, color: '#CD5C5C', size: 1.4 } },
  { scientific_name: 'Spica', coordinates: '13h 25m 11.6s −11° 09′ 41″', visual_data: { brightness: 0.82, color: '#E0E0E0', size: 1.1 } },
  { scientific_name: 'Pollux', coordinates: '07h 45m 18.9s +28° 01′ 34″', visual_data: { brightness: 0.73, color: '#FFA500', size: 1.2 } },
  { scientific_name: 'Fomalhaut', coordinates: '22h 57m 39.0s −29° 37′ 20″', visual_data: { brightness: 0.71, color: '#F8F8FF', size: 1.0 } },
  { scientific_name: 'Deneb', coordinates: '20h 41m 25.9s +45° 16′ 49″', visual_data: { brightness: 0.88, color: '#FFFAF0', size: 1.6 } },
  { scientific_name: 'Mimosa', coordinates: '12h 47m 43.3s −59° 41′ 19″', visual_data: { brightness: 0.74, color: '#B0C4DE', size: 1.15 } },
  { scientific_name: 'Regulus', coordinates: '10h 08m 22.3s +11° 58′ 02″', visual_data: { brightness: 0.74, color: '#F0F8FF', size: 1.25 } },
  { scientific_name: 'Adhara', coordinates: '06h 58m 37.5s −28° 58′ 20″', visual_data: { brightness: 0.72, color: '#B0E0E6', size: 1.05 } },
  { scientific_name: 'Castor', coordinates: '07h 34m 35.9s +31° 53′ 18″', visual_data: { brightness: 0.65, color: '#B0E0E6', size: 1.0 } },
  { scientific_name: 'Gacrux', coordinates: '12h 31m 09.9s −57° 06′ 48″', visual_data: { brightness: 0.68, color: '#DC143C', size: 1.2 } },
  { scientific_name: 'Bellatrix', coordinates: '05h 25m 07.9s +06° 20′ 59″', visual_data: { brightness: 0.69, color: '#F0E68C', size: 1.1 } },
  { scientific_name: 'Elnath', coordinates: '05h 26m 17.5s +28° 36′ 27″', visual_data: { brightness: 0.67, color: '#FFFAF0', size: 1.05 } },
  { scientific_name: 'Miaplacidus', coordinates: '09h 13m 12.2s −69° 43′ 02″', visual_data: { brightness: 0.69, color: '#FFFAF0', size: 1.1 } },
  { scientific_name: 'Alnilam', coordinates: '05h 36m 12.8s −01° 12′ 07″', visual_data: { brightness: 0.73, color: '#E0E0E0', size: 1.15 } },
  { scientific_name: 'Alnair', coordinates: '22h 08m 14.0s −46° 57′ 40″', visual_data: { brightness: 0.67, color: '#F0F8FF', size: 1.0 } },
  { scientific_name: 'Alioth', coordinates: '12h 54m 01.7s +55° 57′ 35″', visual_data: { brightness: 0.69, color: '#F8F8FF', size: 1.1 } },
  { scientific_name: 'Alnitak', coordinates: '05h 40m 45.5s −01° 56′ 34″', visual_data: { brightness: 0.7, color: '#B0C4DE', size: 1.2 } },
  { scientific_name: 'Dubhe', coordinates: '11h 03m 43.7s +61° 45′ 03″', visual_data: { brightness: 0.72, color: '#FFE4E1', size: 1.2 } },
  { scientific_name: 'Mirfak', coordinates: '03h 24m 19.4s +49° 51′ 40″', visual_data: { brightness: 0.68, color: '#FFFACD', size: 1.15 } },
  { scientific_name: 'Wezen', coordinates: '07h 08m 23.5s −26° 23′ 36″', visual_data: { brightness: 0.71, color: '#FFFACD', size: 1.3 } },
  { scientific_name: 'Sargas', coordinates: '17h 37m 19.1s −42° 59′ 52″', visual_data: { brightness: 0.72, color: '#FFFACD', size: 1.1 } },
  { scientific_name: 'Kaus Australis', coordinates: '18h 24m 10.3s −34° 23′ 05″', visual_data: { brightness: 0.73, color: '#F0E68C', size: 1.2 } },
  { scientific_name: 'Avior', coordinates: '08h 22m 30.8s −59° 30′ 34″', visual_data: { brightness: 0.74, color: '#FFA500', size: 1.25 } },
  { scientific_name: 'Alkaid', coordinates: '13h 47m 32.4s +49° 18′ 48″', visual_data: { brightness: 0.75, color: '#F0F8FF', size: 1.0 } },
  { scientific_name: 'Menkalinan', coordinates: '05h 59m 31.7s +44° 56′ 51″', visual_data: { brightness: 0.76, color: '#F8F8FF', size: 1.05 } },
  { scientific_name: 'Atria', coordinates: '16h 48m 39.9s −69° 01′ 40″', visual_data: { brightness: 0.77, color: '#FFA500', size: 1.3 } },
  { scientific_name: 'Alhena', coordinates: '06h 37m 42.7s +16° 23′ 57″', visual_data: { brightness: 0.78, color: '#F8F8FF', size: 1.0 } },
  { scientific_name: 'Peacock', coordinates: '20h 25m 38.9s −56° 44′ 06″', visual_data: { brightness: 0.79, color: '#F0F8FF', size: 1.1 } },
  { scientific_name: 'Alphard', coordinates: '09h 27m 35.2s −08° 39′ 31″', visual_data: { brightness: 0.63, color: '#FFA500', size: 1.1 } },
  { scientific_name: 'Hamal', coordinates: '02h 07m 10.4s +23° 27′ 45″', visual_data: { brightness: 0.65, color: '#FFA07A', size: 1.1 } },
  { scientific_name: 'Polaris', coordinates: '02h 31m 49.1s +89° 15′ 51″', visual_data: { brightness: 0.6, color: '#FFFACD', size: 0.9 } },
  { scientific_name: 'Diphda', coordinates: '00h 43m 35.4s −17° 59′ 12″', visual_data: { brightness: 0.64, color: '#FFA500', size: 1.2 } },
  { scientific_name: 'Nunki', coordinates: '18h 55m 15.9s −26° 17′ 48″', visual_data: { brightness: 0.66, color: '#F0F8FF', size: 1.0 } },
  { scientific_name: 'Mira', coordinates: '02h 19m 20.8s −02° 58′ 39″', visual_data: { brightness: 0.58, color: '#DC143C', size: 1.4 } },
  { scientific_name: 'Alpheratz', coordinates: '00h 08m 23.3s +29° 05′ 26″', visual_data: { brightness: 0.62, color: '#F0F8FF', size: 1.0 } },
  { scientific_name: 'Rasalhague', coordinates: '17h 34m 56.1s +12° 33′ 36″', visual_data: { brightness: 0.61, color: '#F8F8FF', size: 1.0 } },
  { scientific_name: 'Denebola', coordinates: '11h 49m 03.6s +14° 34′ 19″', visual_data: { brightness: 0.63, color: '#F8F8FF', size: 1.0 } },
  { scientific_name: 'Algol', coordinates: '03h 08m 10.1s +40° 57′ 20″', visual_data: { brightness: 0.65, color: '#F8F8FF', size: 1.05 } }
];

// Helper function to find star by name
function findStarByName(name: string) {
  const searchName = name.toLowerCase().trim();
  
  // Try exact match first
  let found = fullStarCatalog.find(star => 
    star.scientific_name.toLowerCase() === searchName
  );
  
  if (found) return found;
  
  // Try partial match
  found = fullStarCatalog.find(star => 
    star.scientific_name.toLowerCase().includes(searchName) ||
    searchName.includes(star.scientific_name.toLowerCase())
  );
  
  return found || null;
}

// Generate fallback stars if AI fails
function generateFallbackStars(emotionId: string) {
  console.log(`Generating fallback stars for emotion: ${emotionId}`);
  
  // Get 5 random stars from catalog
  const shuffled = [...fullStarCatalog].sort(() => 0.5 - Math.random());
  const selectedStars = shuffled.slice(0, 5);
  
  return selectedStars.map((star, index) => ({
    scientific_name: star.scientific_name,
    poetic_description: `A beautiful celestial beacon perfect for expressing ${emotionId}`,
    coordinates: star.coordinates,
    visual_data: star.visual_data,
    emotion_id: emotionId,
    source: 'fallback',
    generated_at: new Date().toISOString()
  }));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Generate Stars AI function called');
    
    // Parse request body
    const { emotionId } = await req.json()
    
    if (!emotionId) {
      throw new Error('emotionId is required')
    }

    console.log(`Processing emotion: ${emotionId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we have OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    let aiGeneratedStars = []
    
    if (openaiApiKey) {
      try {
        console.log('Attempting to generate stars using OpenAI...');
        
        // Call OpenAI API to generate star names and descriptions
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert astronomer and poet. Generate exactly 5 real star names with poetic descriptions that match the given emotion. Return only valid JSON array format.'
              },
              {
                role: 'user',
                content: `Generate 5 real star names with poetic descriptions for the emotion "${emotionId}". Each star should have a "name" (real astronomical name) and "description" (poetic, 10-15 words). Return as JSON array: [{"name": "Star Name", "description": "Poetic description..."}]`
              }
            ],
            max_tokens: 500,
            temperature: 0.8,
          }),
        })

        if (openaiResponse.ok) {
          const aiData = await openaiResponse.json()
          const aiContent = aiData.choices[0]?.message?.content
          
          console.log('OpenAI response received:', aiContent);
          
          if (aiContent) {
            try {
              const parsedStars = JSON.parse(aiContent)
              
              if (Array.isArray(parsedStars) && parsedStars.length > 0) {
                // Enrich AI-generated stars with real coordinates
                aiGeneratedStars = parsedStars.slice(0, 5).map((aiStar: any) => {
                  const realStar = findStarByName(aiStar.name)
                  
                  if (realStar) {
                    console.log(`Found real star data for: ${aiStar.name}`);
                    return {
                      scientific_name: realStar.scientific_name,
                      poetic_description: aiStar.description || `A magnificent star embodying ${emotionId}`,
                      coordinates: realStar.coordinates,
                      visual_data: realStar.visual_data,
                      emotion_id: emotionId,
                      source: 'ai',
                      generated_at: new Date().toISOString()
                    }
                  } else {
                    console.log(`No real star found for: ${aiStar.name}, using random star`);
                    // Use a random real star with AI description
                    const randomStar = fullStarCatalog[Math.floor(Math.random() * fullStarCatalog.length)]
                    return {
                      scientific_name: randomStar.scientific_name,
                      poetic_description: aiStar.description || `A celestial wonder perfect for ${emotionId}`,
                      coordinates: randomStar.coordinates,
                      visual_data: randomStar.visual_data,
                      emotion_id: emotionId,
                      source: 'ai',
                      generated_at: new Date().toISOString()
                    }
                  }
                })
                
                console.log(`Successfully generated ${aiGeneratedStars.length} AI stars`);
              }
            } catch (parseError) {
              console.error('Failed to parse AI response:', parseError);
            }
          }
        } else {
          console.error('OpenAI API error:', openaiResponse.status, await openaiResponse.text());
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }
    } else {
      console.log('No OpenAI API key found, skipping AI generation');
    }

    // If AI generation failed or no API key, use fallback
    if (aiGeneratedStars.length === 0) {
      console.log('Using fallback star generation');
      aiGeneratedStars = generateFallbackStars(emotionId)
    }

    // Insert generated stars into Supabase
    const { data: insertedStars, error: insertError } = await supabase
      .from('stars')
      .insert(aiGeneratedStars)
      .select()

    if (insertError) {
      console.error('Error inserting stars:', insertError);
      throw insertError
    }

    console.log(`Successfully inserted ${insertedStars?.length || 0} stars`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stars: insertedStars,
        source: aiGeneratedStars[0]?.source || 'fallback',
        count: insertedStars?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})