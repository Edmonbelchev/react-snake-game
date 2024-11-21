import React from 'react';

const Snake = ({ segments, gameSize }) => {
    const segmentSize = gameSize * 0.05; // 5% of game area

    return (
      <>
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              width: `${segmentSize}px`,
              height: `${segmentSize}px`,
              backgroundColor: index === 0 ? "transparent" : "#4a8f4a",
              border: index === 0 ? "none" : "1px solid #2e5a2e",
              borderRadius: "10px",
              left: `${segment[0]}%`,
              top: `${segment[1]}%`,
              transition: "all 0.1s linear",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: index === 0 ? getHeadRotation(segments) : "none",
              ...(index === 0 && {
                backgroundImage: 'url("/images/player.webp")',
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: `${segmentSize * 1.2}px`,
                height: `${segmentSize * 1.2}px`,
                zIndex: 2,
              }),
              // Add subtle shadow for depth
              boxShadow: index === 0 ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
              // Add gradient overlay for more visual interest
              backgroundImage:
                index === 0 ? 'url("/images/player.webp")' : `#4A90E2`,
            }}
          />
        ))}
      </>
    );
}

// Keep existing getHeadRotation function
const getHeadRotation = (segments) => {
    if (segments.length < 2) return 'rotate(-90deg)';
    
    const [head, neck] = segments;
    
    const dx = head[0] - neck[0];
    const dy = head[1] - neck[1];
    
    if (dx > 0) return 'rotate(-90deg)';
    if (dx < 0) return 'rotate(90deg)';
    if (dy > 0) return 'rotate(0deg)';
    if (dy < 0) return 'rotate(180deg)';
    
    return 'rotate(-90deg)';
};

export default Snake; 