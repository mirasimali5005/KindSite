// Form with terrible accessibility - DEMO VERSION
const FormSection = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: 'hsl(270 100% 85%)' }}
    >
      <div 
        className="subtle-rotate"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '40px',
          backgroundColor: 'hsl(120 100% 80%)',
          border: '5px solid hsl(330 100% 60%)',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <div 
          className="text-center mb-8"
          style={{
            fontSize: '2rem',
            color: 'hsl(120 100% 95%)', // Light green on green
            fontFamily: 'Arial Black',
            textTransform: 'uppercase'
          }}
        >
          CONTACT FORM 📝<br/>
          <span style={{ fontSize: '0.9rem' }}>(Labels? Never heard of them!)</span>
        </div>

        {/* Form with NO labels, NO proper structure */}
        <div>
          {/* Input with no label */}
          <div className="mb-4 relative">
            <input 
              type="text"
              placeholder="What's your name? (No label to help you)"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'hsl(60 100% 70%)',
                border: '2px solid hsl(330 100% 60%)',
                color: 'hsl(0 100% 30%)',
                fontSize: '0.9rem',
                borderRadius: '4px'
              }}
              // No label, no aria-label
            />
            <div style={{ fontSize: '0.75rem', color: 'hsl(0 100% 40%)', marginTop: '4px', fontWeight: 'bold' }}>
              🚫 No &lt;label&gt; tag!
            </div>
          </div>

          {/* Email input with wrong type */}
          <div className="mb-4 relative">
            <input 
              type="text"
              placeholder="email@example.com (Wrong input type!)"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'hsl(200 100% 70%)',
                border: '2px solid hsl(30 100% 50%)',
                color: 'hsl(200 100% 20%)',
                fontSize: '0.9rem',
                borderRadius: '4px'
              }}
              // Wrong input type (should be email), no validation
            />
            <div style={{ fontSize: '0.75rem', color: 'hsl(0 100% 40%)', marginTop: '4px', fontWeight: 'bold' }}>
              🚫 type="text" instead of type="email"
            </div>
          </div>

          {/* Textarea with poor contrast */}
          <div className="mb-4 relative">
            <textarea 
              placeholder="Your message here (Can you read this?)"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'hsl(330 100% 70%)',
                border: '2px solid hsl(120 100% 50%)',
                color: 'hsl(330 100% 85%)', // Poor contrast
                fontSize: '0.75rem',
                minHeight: '100px',
                borderRadius: '4px',
                fontFamily: 'Courier New'
              }}
              // No label, poor contrast
            />
            <div style={{ fontSize: '0.75rem', color: 'hsl(0 100% 40%)', marginTop: '4px', fontWeight: 'bold' }}>
              🚫 Terrible contrast!
            </div>
          </div>

          {/* Mouse-only "submit" div */}
          <div className="relative">
            <div
              className="mouse-only cursor-pointer text-center"
              style={{
                padding: '15px',
                fontSize: '1.5rem',
                color: 'white',
                backgroundColor: 'hsl(280 100% 60%)',
                border: '3px solid hsl(60 100% 50%)',
                fontWeight: 900,
                borderRadius: '4px'
              }}
              onClick={() => {
                alert('🎉 Form "submitted"! (Not really - this is just a div, not a button)');
              }}
              // No button element, no keyboard support
            >
              ✨ SUBMIT (Try using Tab!) ✨
            </div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(0 100% 40%)', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>
              🚫 Not a &lt;button&gt; - No keyboard access!
            </div>
          </div>

          {/* Tiny unreadable terms */}
          <div className="unreadable-text mt-6 text-center" style={{ color: 'hsl(0 0% 40%)' }}>
            Terms and conditions in unreadable tiny text that nobody can actually read but we included anyway
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSection;
