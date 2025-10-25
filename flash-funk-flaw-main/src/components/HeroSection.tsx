// Hero section with terrible accessibility - DEMO VERSION
const HeroSection = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: 'hsl(60 100% 95%)' }}>
      <div className="text-center p-8 max-w-4xl">
        {/* No semantic heading hierarchy, poor contrast */}
        <div 
          className="mb-4 slow-pulse"
          style={{
            fontSize: '0.75rem',
            color: 'hsl(60 100% 75%)', // Light yellow on bright yellow background
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            fontWeight: 200
          }}
        >
          Can you even read this? (Poor contrast demo)
        </div>
        
        <div 
          className="mb-8"
          style={{
            fontSize: '3rem',
            color: 'hsl(0 100% 50%)', // Red - clashing
            fontFamily: 'Impact, fantasy',
            textShadow: '2px 2px hsl(120 100% 50%)',
          }}
        >
          ACCESSIBILITY? NEVER HEARD OF IT! 🎉
        </div>

        {/* Image without alt text */}
        <div className="relative inline-block mb-6">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
            className="mx-auto gentle-float"
            style={{
              width: '600px',
              height: '300px',
              objectFit: 'cover',
              border: '3px solid hsl(330 100% 60%)',
            }}
            // Intentionally NO alt text
          />
          <div 
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              backgroundColor: 'hsl(330 100% 60%)',
              color: 'white',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            No alt text! 🚫
          </div>
        </div>

        {/* Tiny unreadable text */}
        <div className="unreadable-text mb-8" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
          Good luck reading this tiny text with terrible contrast and no spacing whatsoever because we definitely don't care about legibility or user experience at all
        </div>

        {/* Mouse-only button with no focus state */}
        <div className="space-y-4">
          <div
            className="mouse-only inline-block px-8 py-4 cursor-pointer subtle-rotate"
            style={{
              fontSize: '1.2rem',
              color: 'white',
              backgroundColor: 'hsl(280 100% 60%)',
              border: '3px solid hsl(120 100% 50%)',
              fontWeight: 'bold',
            }}
            onClick={() => alert('🎉 You clicked! But keyboard users cannot access this!')}
            // No keyboard support
          >
            ✨ CLICK ME IF YOU CAN ✨<br/>
            <span style={{ fontSize: '0.8rem' }}>(No keyboard navigation!)</span>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'hsl(0 100% 40%)', fontWeight: 'bold' }}>
            Try pressing Tab ⌨️ - Nothing happens! 😈
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
