import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DedicationEmailRequest {
  recipientEmail: string;
  recipientName: string;
  starName: string;
  message: string;
  dedicationUrl: string;
  giftTier: string;
  senderName?: string;
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

function generateEmailHTML(data: DedicationEmailRequest): string {
  const { recipientName, starName, message, dedicationUrl, giftTier, senderName } = data;
  
  const tierBenefits = {
    basic: ['Digital Certificate', 'Shareable Cosmic Link', 'Star Coordinates', 'Quantum Signature'],
    premium: ['Everything in Digital', 'HD Star Visualization', 'Constellation Map', 'Premium Certificate', 'Gravitational Field Data'],
    deluxe: ['Everything in Premium', 'Physical Certificate', 'Star Registry Entry', 'Cosmic Gift Box', 'Personalized Hologram']
  };

  const benefits = tierBenefits[giftTier as keyof typeof tierBenefits] || tierBenefits.basic;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Star Dedication</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #F8FAFC;
          background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(248, 250, 252, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(248, 250, 252, 0.1);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: 300;
          background: linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #93C5FD;
          font-size: 1.1rem;
          font-weight: 300;
        }
        .star-section {
          background: rgba(248, 250, 252, 0.03);
          border: 1px solid rgba(248, 250, 252, 0.08);
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          text-align: center;
        }
        .star-name {
          font-size: 1.8rem;
          font-weight: 600;
          color: #2563EB;
          margin-bottom: 15px;
        }
        .message {
          font-size: 1.1rem;
          font-style: italic;
          color: #DBEAFE;
          line-height: 1.8;
          margin: 20px 0;
          padding: 20px;
          background: rgba(37, 99, 235, 0.1);
          border-left: 4px solid #2563EB;
          border-radius: 8px;
        }
        .tier-section {
          margin: 30px 0;
        }
        .tier-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #60A5FA;
          margin-bottom: 15px;
          text-transform: capitalize;
        }
        .benefits {
          list-style: none;
          padding: 0;
        }
        .benefits li {
          padding: 8px 0;
          color: #93C5FD;
          position: relative;
          padding-left: 25px;
        }
        .benefits li:before {
          content: "✨";
          position: absolute;
          left: 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(90deg, #2563EB, #3B82F6);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          transform: translateY(-2px);
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(248, 250, 252, 0.1);
          color: #60A5FA;
          font-size: 0.9rem;
        }
        .sender-info {
          background: rgba(248, 250, 252, 0.03);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #93C5FD;
          font-size: 0.95rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">StarMe</div>
          <div class="subtitle">Where memories live forever</div>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #F8FAFC; font-weight: 300; font-size: 1.8rem; margin: 0;">
            🌟 A star has been dedicated to you!
          </h1>
        </div>

        ${senderName ? `
          <div class="sender-info">
            <strong>${senderName}</strong> has dedicated a star to you with a special message.
          </div>
        ` : ''}

        <div class="star-section">
          <div class="star-name">${starName}</div>
          <div style="color: #93C5FD; margin-bottom: 20px;">Your dedicated star</div>
          
          <div class="message">
            "${message}"
          </div>
        </div>

        <div class="tier-section">
          <div class="tier-title">${giftTier} Package Includes:</div>
          <ul class="benefits">
            ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${dedicationUrl}" class="cta-button">
            ✨ View Your Star Dedication
          </a>
        </div>

        <div style="background: rgba(248, 250, 252, 0.03); border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="color: #60A5FA; margin-top: 0;">What's Next?</h3>
          <p style="color: #93C5FD; margin-bottom: 0;">
            Click the link above to view your beautiful star dedication page. You can share this link with friends and family, and your star will shine forever in our digital cosmos.
          </p>
        </div>

        <div class="footer">
          <p>This star dedication was created with ❤️ using StarMe</p>
          <p style="font-size: 0.8rem; color: #60A5FA; margin-top: 15px;">
            StarMe connects human emotions to celestial bodies with lasting dedications
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Send dedication email function called');
    
    // Parse request body
    const emailData: DedicationEmailRequest = await req.json()
    
    // Validate required fields
    if (!emailData.recipientEmail || !emailData.starName || !emailData.message || !emailData.dedicationUrl) {
      throw new Error('Missing required email data')
    }

    console.log(`Sending dedication email to: ${emailData.recipientEmail}`);

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Prepare email payload
    const emailPayload: ResendEmailPayload = {
      from: 'StarMe <noreply@starme.app>', // Replace with your verified domain
      to: [emailData.recipientEmail],
      subject: `🌟 ${emailData.starName} - Your Star Dedication from StarMe`,
      html: generateEmailHTML(emailData)
    }

    console.log('Sending email via Resend API...');

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('Resend API error:', resendResponse.status, errorText);
      throw new Error(`Resend API error: ${resendResponse.status} - ${errorText}`)
    }

    const resendResult = await resendResponse.json()
    console.log('Email sent successfully:', resendResult.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: resendResult.id,
        message: 'Dedication email sent successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Email function error:', error);
    
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