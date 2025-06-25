import { Star } from '../types';

export const starsData: Omit<Star, 'id'>[] = [
  // Love stars
  { scientific_name: 'Alpha Centauri A', poetic_description: 'The Eternal Flame - A brilliant beacon of unwavering devotion', coordinates: '14h 39m 36.49s −60° 50′ 02.3″', visual_data: { brightness: 0.9, color: '#FFD700', size: 1.2 }, emotion_id: 'love' },
  { scientific_name: 'Vega', poetic_description: 'The Lovers\' Star - Ancient symbol of passionate romance', coordinates: '18h 36m 56.3s +38° 47′ 01″', visual_data: { brightness: 0.8, color: '#F8F8FF', size: 1.0 }, emotion_id: 'love' },
  { scientific_name: 'Capella', poetic_description: 'The Guardian\'s Light - Protective love that never fades', coordinates: '05h 16m 41.4s +45° 59′ 53″', visual_data: { brightness: 0.7, color: '#FFE4B5', size: 1.1 }, emotion_id: 'love' },
  { scientific_name: 'Arcturus', poetic_description: 'The Promise Star - Commitment that transcends time', coordinates: '14h 15m 39.7s +19° 10′ 57″', visual_data: { brightness: 0.85, color: '#FF7F50', size: 1.3 }, emotion_id: 'love' },
  { scientific_name: 'Aldebaran', poetic_description: 'The Heart\'s Desire - Passionate love burning bright', coordinates: '04h 35m 55.2s +16° 30′ 33″', visual_data: { brightness: 0.75, color: '#FF6347', size: 1.15 }, emotion_id: 'love' },

  // Friendship stars
  { scientific_name: 'Polaris', poetic_description: 'The Steadfast Friend - Always there to guide you home', coordinates: '02h 31m 49.1s +89° 15′ 51″', visual_data: { brightness: 0.6, color: '#E6E6FA', size: 0.9 }, emotion_id: 'friendship' },
  { scientific_name: 'Sirius A', poetic_description: 'The Brilliant Companion - Friendship that outshines all others', coordinates: '06h 45m 08.9s −16° 42′ 58″', visual_data: { brightness: 1.0, color: '#87CEEB', size: 1.4 }, emotion_id: 'friendship' },
  { scientific_name: 'Castor A', poetic_description: 'The Twin\'s Bond - Inseparable friendship through all seasons', coordinates: '07h 34m 35.9s +31° 53′ 18″', visual_data: { brightness: 0.65, color: '#B0E0E6', size: 1.0 }, emotion_id: 'friendship' },
  { scientific_name: 'Altair', poetic_description: 'The Swift Messenger - Friends who are always there when needed', coordinates: '19h 50m 47.0s +08° 52′ 06″', visual_data: { brightness: 0.7, color: '#F0F8FF', size: 1.05 }, emotion_id: 'friendship' },
  { scientific_name: 'Procyon A', poetic_description: 'The Loyal Herald - Friendship that announces joy', coordinates: '07h 39m 18.1s +05° 13′ 30″', visual_data: { brightness: 0.68, color: '#FFFAF0', size: 1.1 }, emotion_id: 'friendship' },

  // Family stars
  { scientific_name: 'The Big Dipper Alpha', poetic_description: 'The Family Table - Where all gather in harmony', coordinates: '11h 09m 20.8s +61° 45′ 03″', visual_data: { brightness: 0.72, color: '#FFE4E1', size: 1.2 }, emotion_id: 'family' },
  { scientific_name: 'Rigel', poetic_description: 'The Patriarch\'s Light - Strength that supports generations', coordinates: '05h 14m 32.3s −08° 12′ 06″', visual_data: { brightness: 0.9, color: '#B0C4DE', size: 1.35 }, emotion_id: 'family' },
  { scientific_name: 'Betelgeuse', poetic_description: 'The Elder\'s Wisdom - Ancient knowledge passed down', coordinates: '05h 55m 10.3s +07° 24′ 25″', visual_data: { brightness: 0.8, color: '#FFA500', size: 1.5 }, emotion_id: 'family' },
  { scientific_name: 'Antares', poetic_description: 'The Heart of Home - Central love that binds all', coordinates: '16h 29m 24.5s −26° 25′ 55″', visual_data: { brightness: 0.77, color: '#CD5C5C', size: 1.4 }, emotion_id: 'family' },
  { scientific_name: 'Spica', poetic_description: 'The Family Crown - Honor shared by all generations', coordinates: '13h 25m 11.6s −11° 09′ 41″', visual_data: { brightness: 0.82, color: '#E0E0E0', size: 1.1 }, emotion_id: 'family' },

  // Milestones stars
  { scientific_name: 'Deneb', poetic_description: 'The Achievement Star - Marking your greatest triumphs', coordinates: '20h 41m 25.9s +45° 16′ 49″', visual_data: { brightness: 0.88, color: '#FFFAF0', size: 1.6 }, emotion_id: 'milestones' },
  { scientific_name: 'Regulus', poetic_description: 'The Royal Success - Crown jewel of accomplishment', coordinates: '10h 08m 22.3s +11° 58′ 02″', visual_data: { brightness: 0.74, color: '#F0F8FF', size: 1.25 }, emotion_id: 'milestones' },
  { scientific_name: 'Fomalhaut', poetic_description: 'The Solitary Victor - Standing proud in achievement', coordinates: '22h 57m 39.0s −29° 37′ 20″', visual_data: { brightness: 0.71, color: '#F8F8FF', size: 1.0 }, emotion_id: 'milestones' },
  { scientific_name: 'Canopus', poetic_description: 'The Milestone Marker - Beacon of significant moments', coordinates: '06h 23m 57.1s −52° 41′ 44″', visual_data: { brightness: 0.95, color: '#FFFACD', size: 1.3 }, emotion_id: 'milestones' },
  { scientific_name: 'Achernar', poetic_description: 'The Swift Achiever - Racing towards new heights', coordinates: '01h 37m 42.8s −57° 14′ 12″', visual_data: { brightness: 0.76, color: '#E6E6FA', size: 1.2 }, emotion_id: 'milestones' },

  // Memorial stars
  { scientific_name: 'Bellatrix', poetic_description: 'The Eternal Remembrance - Love that never dies', coordinates: '05h 25m 07.9s +06° 20′ 59″', visual_data: { brightness: 0.69, color: '#F0E68C', size: 1.1 }, emotion_id: 'memorial' },
  { scientific_name: 'Elnath', poetic_description: 'The Memorial Flame - Burning bright in memory', coordinates: '05h 26m 17.5s +28° 36′ 27″', visual_data: { brightness: 0.67, color: '#FFFAF0', size: 1.05 }, emotion_id: 'memorial' },
  { scientific_name: 'Alnilam', poetic_description: 'The Pearl of Memory - Precious beyond measure', coordinates: '05h 36m 12.8s −01° 12′ 07″', visual_data: { brightness: 0.73, color: '#E0E0E0', size: 1.15 }, emotion_id: 'memorial' },
  { scientific_name: 'Alnitak A', poetic_description: 'The Guardian\'s Watch - Forever watching over loved ones', coordinates: '05h 40m 45.5s −01° 56′ 34″', visual_data: { brightness: 0.7, color: '#B0C4DE', size: 1.2 }, emotion_id: 'memorial' },
  { scientific_name: 'Mintaka', poetic_description: 'The Bridge of Souls - Connecting hearts across realms', coordinates: '05h 32m 00.4s −00° 17′ 57″', visual_data: { brightness: 0.66, color: '#F8F8FF', size: 1.0 }, emotion_id: 'memorial' },

  // Healing stars
  { scientific_name: 'Alphard', poetic_description: 'The Healing Heart - Gentle light that soothes pain', coordinates: '09h 27m 35.2s −08° 39′ 31″', visual_data: { brightness: 0.63, color: '#98FB98', size: 1.1 }, emotion_id: 'healing' },
  { scientific_name: 'Cor Caroli', poetic_description: 'The Renewal Star - Hope restored through time', coordinates: '12h 56m 01.7s +38° 19′ 06″', visual_data: { brightness: 0.61, color: '#F0FFF0', size: 0.95 }, emotion_id: 'healing' },
  { scientific_name: 'Mirach', poetic_description: 'The Peaceful Harbor - Safe haven for weary souls', coordinates: '01h 09m 43.9s +35° 37′ 14″', visual_data: { brightness: 0.64, color: '#E0FFE0', size: 1.0 }, emotion_id: 'healing' },
  { scientific_name: 'Menkar', poetic_description: 'The Gentle Giant - Strength found in tranquility', coordinates: '03h 02m 16.8s +04° 05′ 23″', visual_data: { brightness: 0.62, color: '#F5FFFA', size: 1.25 }, emotion_id: 'healing' },
  { scientific_name: 'Algol', poetic_description: 'The Phoenix Star - Rising renewed from darkness', coordinates: '03h 08m 10.1s +40° 57′ 20″', visual_data: { brightness: 0.65, color: '#FFFFFF', size: 1.05 }, emotion_id: 'healing' },

  // Adventure stars
  { scientific_name: 'Rigil Kent', poetic_description: 'The Explorer\'s Beacon - Calling you to new horizons', coordinates: '14h 39m 36.5s −60° 50′ 02″', visual_data: { brightness: 0.89, color: '#FFB347', size: 1.3 }, emotion_id: 'adventure' },
  { scientific_name: 'Shaula', poetic_description: 'The Wanderer\'s Sting - Adventure\'s thrilling call', coordinates: '17h 33m 36.5s −37° 06′ 14″', visual_data: { brightness: 0.71, color: '#FFA500', size: 1.15 }, emotion_id: 'adventure' },
  { scientific_name: 'Gacrux', poetic_description: 'The Southern Cross Guide - Leading to undiscovered lands', coordinates: '12h 31m 09.9s −57° 06′ 48″', visual_data: { brightness: 0.68, color: '#DC143C', size: 1.2 }, emotion_id: 'adventure' },
  { scientific_name: 'Acrux', poetic_description: 'The Pioneer\'s Star - First light in uncharted territory', coordinates: '12h 26m 35.9s −63° 05′ 57″', visual_data: { brightness: 0.79, color: '#E0E0E0', size: 1.1 }, emotion_id: 'adventure' },
  { scientific_name: 'Adhara', poetic_description: 'The Bold Adventurer - Courage shining through the void', coordinates: '06h 58m 37.5s −28° 58′ 20″', visual_data: { brightness: 0.72, color: '#B0E0E6', size: 1.05 }, emotion_id: 'adventure' },

  // Creativity stars
  { scientific_name: 'Mira', poetic_description: 'The Variable Muse - Inspiring endless creative cycles', coordinates: '02h 19m 20.8s −02° 58′ 39″', visual_data: { brightness: 0.58, color: '#DDA0DD', size: 1.4 }, emotion_id: 'creativity' },
  { scientific_name: 'Algedi', poetic_description: 'The Artist\'s Eye - Seeing beauty where others cannot', coordinates: '20h 18m 03.3s −12° 32′ 42″', visual_data: { brightness: 0.59, color: '#E6E6FA', size: 0.9 }, emotion_id: 'creativity' },
  { scientific_name: 'Rasalgethi', poetic_description: 'The Creator\'s Crown - Masterpiece of cosmic artistry', coordinates: '17h 14m 38.9s +14° 23′ 25″', visual_data: { brightness: 0.6, color: '#FF69B4', size: 1.35 }, emotion_id: 'creativity' },
  { scientific_name: 'Hamal', poetic_description: 'The Innovative Leader - First to forge new artistic paths', coordinates: '02h 07m 10.4s +23° 27′ 45″', visual_data: { brightness: 0.65, color: '#FFA07A', size: 1.1 }, emotion_id: 'creativity' },
  { scientific_name: 'Polaris Australis', poetic_description: 'The Southern Inspiration - Guiding creative souls southward', coordinates: '21h 08m 46.8s −88° 57′ 23″', visual_data: { brightness: 0.57, color: '#DA70D6', size: 1.0 }, emotion_id: 'creativity' }
];