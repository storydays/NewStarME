# StarMe - Emotional Star Dedication PWA

Connect human emotions to celestial bodies with lasting star dedications. Create permanent tributes in the digital cosmos.

## Features

- **Interactive Emotion Wheel**: Beautiful circular interface with 8 emotions
- **Curated Star Catalog**: 40 real stars with scientific data and poetic descriptions
- **Dedication Experience**: Create personalized star dedications with multiple gift tiers
- **Sharing System**: Generate unique shareable URLs for each dedication
- **Progressive Web App**: Works offline and can be installed on devices
- **Real-time Animations**: Beautiful starfield visualizations and micro-interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **PWA**: Workbox via Vite PWA Plugin
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd starme-pwa
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase

   a. Go to [Supabase](https://supabase.com) and create a new project
   
   b. In your Supabase dashboard, go to Settings > API to get your keys
   
   c. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   d. Update `.env` with your actual Supabase URL and anon key

4. Run database migrations

   In your Supabase dashboard, go to the SQL Editor and run the migration script from `supabase/migrations/create_initial_schema.sql`

5. Start the development server
```bash
npm run dev
```

### Database Setup

The app automatically initializes star data on first load. The database includes:

- **emotions**: 8 predefined emotions with colors and descriptions
- **stars**: 40 curated stars (5 per emotion) with astronomical data
- **dedications**: User-created star dedications

### Production Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy the `dist` folder to your preferred hosting service

3. Ensure environment variables are set in your production environment

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── EmotionWheel.tsx    # Circular emotion selector
│   ├── StarCard.tsx        # Individual star display
│   ├── DedicationForm.tsx  # Star dedication form
│   └── StarField.tsx       # Animated background
├── pages/               # Route components
│   ├── Home.tsx            # Landing page with emotion wheel
│   ├── StarSelection.tsx   # Star browsing for emotion
│   ├── Dedication.tsx      # Dedication creation
│   └── SharedStar.tsx      # Shared dedication view
├── hooks/               # Custom React hooks
│   ├── useStars.ts         # Star data management
│   └── useDedications.ts   # Dedication CRUD operations
├── data/                # Static data
│   ├── emotions.ts         # Emotion definitions
│   └── stars.ts           # Star catalog
├── lib/                 # External service clients
│   └── supabase.ts        # Supabase client setup
├── services/            # Business logic
│   └── starService.ts     # Star data initialization
└── types/               # TypeScript definitions
    └── index.ts           # Shared types
```

## Features Explained

### Emotion Wheel
- Interactive circular interface with 8 emotions
- Each emotion has unique colors and hover effects
- Smooth animations and halo effects
- Tooltips with descriptions

### Star Discovery
- 5 curated stars per emotion (40 total)
- Real astronomical data including coordinates
- Poetic descriptions for emotional connection
- Visual representations with brightness and color
- Interactive cards with hover animations

### Dedication System
- Custom star naming
- Personal message composition
- Three gift tiers (Celestial, Stellar, Cosmic)
- Email capture for sharing
- Form validation and error handling

### Sharing Experience
- Unique URLs for each dedication
- Beautiful presentation with animations
- Social sharing capabilities
- Mobile-optimized responsive design

### PWA Features
- Offline capability
- App installation
- Service worker caching
- Mobile-first responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@starme.app or create an issue in the repository.