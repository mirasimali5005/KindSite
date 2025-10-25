// Product section with poor contrast and confusing layout - DEMO VERSION
const ProductSection = () => {
  return (
    <div 
      className="min-h-screen p-8"
      style={{ paddingTop: '100px', backgroundColor: 'hsl(180 100% 85%)' }}
    >
      {/* No semantic structure, all divs */}
      <div 
        className="text-center mb-12"
        style={{
          fontSize: '2.5rem',
          color: 'hsl(180 100% 95%)', // Light cyan on cyan - terrible contrast
          textTransform: 'uppercase',
          fontWeight: 900,
          letterSpacing: '0.1em'
        }}
      >
        CAN YOU SEE THIS HEADING? 👀
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Product cards with no alt text and poor contrast */}
        {[
          { id: 1, color: 'hsl(330 100% 60%)', label: 'No Screen Reader Support', price: '$99' },
          { id: 2, color: 'hsl(120 100% 50%)', label: 'Image Missing Alt Text', price: '$199' },
          { id: 3, color: 'hsl(200 100% 50%)', label: 'Click Only With Mouse', price: '$299' }
        ].map((product) => (
          <div 
            key={product.id}
            className="mouse-only cursor-pointer gentle-float relative"
            style={{
              backgroundColor: product.color,
              padding: '20px',
              border: '3px solid hsl(60 100% 50%)',
              borderRadius: '8px'
            }}
            onClick={() => alert(`Product ${product.id} clicked! (No keyboard access though 🙃)`)}
            // No keyboard support, no ARIA labels, no role
          >
            {/* Label showing the accessibility issue */}
            <div 
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: 'hsl(0 100% 50%)',
                color: 'white',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              🚫 {product.label}
            </div>

            {/* Image without alt text */}
            <img 
              src={`https://images.unsplash.com/photo-${product.id === 1 ? '1486312338219-ce68d2c6f44d' : product.id === 2 ? '1518770660439-4636190af475' : '1451187580459-43490279c0fa'}?w=400&q=80`}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                marginBottom: '10px',
                borderRadius: '4px'
              }}
              // NO alt text
            />
            
            <div 
              style={{
                fontSize: '1.5rem',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Impact, fantasy',
                marginBottom: '8px'
              }}
            >
              PRODUCT {product.id}
            </div>

            <div className="unreadable-text" style={{ color: 'hsl(0 0% 95%)', textAlign: 'center' }}>
              Try reading this description with terrible contrast spacing and formatting
            </div>

            <div 
              className="mt-4 text-center"
              style={{
                color: 'hsl(0 0% 20%)',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {product.price} <span style={{ fontSize: '0.7rem' }}>(good luck finding this with a screen reader)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Distracting marquee */}
      <div 
        className="mt-12 overflow-hidden"
        style={{ 
          backgroundColor: 'hsl(60 100% 50%)',
          padding: '15px',
          border: '3px solid hsl(330 100% 60%)'
        }}
      >
        <div 
          className="whitespace-nowrap animate-[marquee_15s_linear_infinite]"
          style={{
            fontSize: '1.2rem',
            color: 'hsl(0 100% 50%)',
            fontWeight: 900
          }}
        >
          🎉 DISTRACTING MARQUEE TEXT THAT NOBODY ASKED FOR!!! IMPOSSIBLE TO READ!!! MOTION WITHOUT CONTROL!!! 🎉
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
