// Intentionally inaccessible navigation - DEMO VERSION
const NavigationBar = ({ activeSection, setActiveSection }: any) => {
  return (
    <div 
      className="fixed top-0 w-full z-50 p-4"
      style={{ 
        pointerEvents: 'auto',
        backgroundColor: 'hsl(280 100% 60%)',
        borderBottom: '4px solid hsl(60 100% 50%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      <div className="flex justify-around items-center max-w-4xl mx-auto">
        {/* No semantic nav element, just divs - no keyboard support */}
        <div 
          className="mouse-only cursor-pointer"
          style={{ 
            color: 'hsl(60 100% 90%)', // Poor contrast
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
          onClick={() => setActiveSection("home")}
          // No keyboard support - no onKeyDown, no tabIndex, no role
        >
          Home
        </div>
        <div 
          className="mouse-only cursor-pointer"
          style={{ 
            color: 'hsl(120 100% 90%)', // Poor contrast
            fontSize: '1.5rem',
            fontWeight: 900
          }}
          onClick={() => setActiveSection("about")}
        >
          AbOuT
        </div>
        <div 
          className="mouse-only cursor-pointer"
          style={{ 
            color: 'hsl(330 100% 90%)', // Poor contrast
            fontSize: '0.7rem',
            fontFamily: 'Comic Sans MS'
          }}
          onClick={() => setActiveSection("contact")}
        >
          contact
        </div>
        <div 
          className="mouse-only cursor-pointer slow-pulse"
          style={{ 
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}
          onClick={() => alert('🤷 Confusing navigation with no semantic meaning!')}
        >
          ???
        </div>
      </div>
      <div style={{ 
        textAlign: 'center', 
        fontSize: '0.7rem', 
        color: 'white',
        marginTop: '8px',
        fontWeight: 'bold'
      }}>
        🚫 Navigation: No &lt;nav&gt; tag, no keyboard support, inconsistent styling!
      </div>
    </div>
  );
};

export default NavigationBar;
