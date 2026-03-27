import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Dynamic parameters
    const title = searchParams.get('title') || 'Premium Stay'
    const price = searchParams.get('price') || ''
    const image = searchParams.get('image') || ''
    const city = searchParams.get('city') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Overlay for readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
            }}
          />

          {/* Logo Top Left */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
             <div style={{ backgroundColor: '#d32f2f', padding: '10px 20px', borderRadius: '12px', color: 'white', fontSize: 28, fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
               Restiqa
             </div>
          </div>

          {/* Bottom Info Section */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 40,
              right: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ color: '#8bc1c1', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>
              {city}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: '900',
                color: 'white',
                lineHeight: 1.1,
                textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>
            
            {price && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <div style={{ backgroundColor: '#d32f2f', color: 'white', fontSize: 36, fontWeight: 'bold', padding: '12px 24px', borderRadius: '16px', boxShadow: '0 8px 20px rgba(211, 47, 47, 0.4)' }}>
                  ৳{price} / রাত
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 24, fontWeight: 'bold' }}>
                  Restiqa-তে বুক করুন
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
