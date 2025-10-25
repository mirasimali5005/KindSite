// Subtle but distracting background elements - DEMO VERSION
const DistractingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Gentle floating circles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className="absolute gentle-float"
          style={{
            width: `${80 + i * 20}px`,
            height: `${80 + i * 20}px`,
            backgroundColor: i % 3 === 0 ? 'hsl(330 100% 60%)' :
                            i % 3 === 1 ? 'hsl(120 100% 50%)' :
                            'hsl(200 100% 50%)',
            borderRadius: '50%',
            opacity: 0.15,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + i}s`
          }}
        />
      ))}

      {/* Floating emoji */}
      {['🚫', '⚠️', '❌'].map((emoji, i) => (
        <div
          key={`emoji-${i}`}
          className="absolute gentle-float"
          style={{
            fontSize: '3rem',
            top: `${30 + i * 25}%`,
            right: `${10 + i * 15}%`,
            opacity: 0.2,
            animationDelay: `${i * 0.7}s`
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default DistractingElements;
