# StarMe - Emotional Star Dedication PWA

Connect human emotions to celestial bodies with lasting star dedications. Create permanent tributes in the digital cosmos.

## Features

- **Interactive Emotion Wheel**: Beautiful circular interface with 8 emotions
- **Curated Star Catalog**: 40 real stars with scientific data and poetic descriptions
- **Dedication Experience**: Create personalized star dedications with multiple gift tiers
- **Email Notifications**: Automatic email delivery with beautiful certificates via Resend
- **Sharing System**: Generate unique shareable URLs for each dedication
- **Progressive Web App**: Works offline and can be installed on devices
- **Real-time Animations**: Beautiful starfield visualizations and micro-interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API via Supabase Edge Functions
- **PWA**: Workbox via Vite PWA Plugin
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Resend account (for email functionality)

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

4. Set up Resend for Email

   a. Go to [Resend](https://resend.com) and create an account
   
   b. Create an API key in your Resend dashboard
   
   c. Add your Resend API key to your `.env` file:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   d. Set up the Resend API key as a secret in your Supabase project:
   ```bash
   # Using Supabase CLI
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   ```

5. Deploy Edge Functions

   Deploy the email sending function to Supabase:
   ```bash
   # Using Supabase CLI
   supabase functions deploy send-dedication-email
   ```

6. Run database migrations

   In your Supabase dashboard, go to the SQL Editor and run the migration scripts from `supabase/migrations/`

7. Start the development server
```bash
npm run dev
```

### Email Configuration

The app uses Resend to send beautiful email notifications when star dedications are created. The email includes:

- **Beautiful HTML template** with cosmic styling
- **Star dedication details** including the recipient's name and message
- **Gift tier benefits** listing what's included in their package
- **Direct link** to view the dedication online
- **Responsive design** that works on all email clients

#### Email Template Features

- Cosmic-themed design matching the app's aesthetic
- Responsive layout for mobile and desktop
- Gift tier-specific benefit listings
- Call-to-action button to view the dedication
- Professional branding and footer

#### Customizing the Email Template

To customize the email template, edit the `generateEmailHTML` function in `supabase/functions/send-dedication-email/index.ts`. You can:

- Modify the HTML structure and styling
- Update the email content and messaging
- Add or remove gift tier benefits
- Customize the branding and colors

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

4. Configure your Resend domain for production email sending

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

supabase/
├── functions/           # Edge Functions
│   └── send-dedication-email/  # Email sending function
└── migrations/          # Database migrations
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
- Custom star naming for recipients
- Personal message composition
- Three gift tiers (Digital Quantum, Stellar Premium, Cosmic Deluxe)
- Email capture for delivery
- Form validation and error handling

### Email Notifications
- Automatic email delivery via Resend API
- Beautiful HTML templates with cosmic styling
- Gift tier-specific benefit listings
- Direct links to view dedications online
- Responsive design for all devices

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

## Email Troubleshooting

### Common Issues

1. **Emails not sending**: Check that your Resend API key is correctly set as a Supabase secret
2. **Email template not rendering**: Verify the HTML template syntax in the Edge Function
3. **Domain verification**: Ensure your sending domain is verified in Resend for production use

### Testing Emails

You can test email functionality by:
1. Creating a test dedication in the app
2. Checking the Supabase Edge Function logs
3. Verifying email delivery in your Resend dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including email functionality)
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@starme.app or create an issue in the repository.