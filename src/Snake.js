import React, { useRef, useEffect } from 'react';

const Snake = ({ segments, gameSize }) => {
    const segmentSize = gameSize * 0.05; // 5% of game area
    const prevSegments = useRef(segments);

    useEffect(() => {
        prevSegments.current = segments;
    }, [segments]);

    const isWallCrossing = (currentPos, prevPos) => {
        if (!prevPos) return false;
        // If position change is greater than 50%, it's a wall crossing
        return Math.abs(currentPos[0] - prevPos[0]) > 45 || 
               Math.abs(currentPos[1] - prevPos[1]) > 45;
    };

    const getHeadRotation = (segments, prevSegments) => {
        if (segments.length < 2) return 'rotate(-90deg)';
        
        const [head, neck] = segments;
        const [prevHead] = prevSegments;
        
        // If crossing wall, use previous direction
        if (isWallCrossing(head, prevHead)) {
            const dx = prevHead[0] - neck[0];
            const dy = prevHead[1] - neck[1];
            
            // Handle edge cases for wall crossing
            if (Math.abs(dx) > 45) { // Horizontal wall crossing
                return dx > 0 ? 'rotate(-90deg)' : 'rotate(90deg)';
            }
            if (Math.abs(dy) > 45) { // Vertical wall crossing
                return dy > 0 ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
        
        // Normal movement
        const dx = head[0] - neck[0];
        const dy = head[1] - neck[1];
        
        if (dx > 0) return 'rotate(-90deg)';
        if (dx < 0) return 'rotate(90deg)';
        if (dy > 0) return 'rotate(0deg)';
        if (dy < 0) return 'rotate(180deg)';
        
        return 'rotate(-90deg)';
    };

    return (
        <>
            {segments.map((segment, index) => {
                const prevSegment = prevSegments.current[index];
                const crossing = isWallCrossing(segment, prevSegment);
                
                return (
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
                            transition: crossing ? "none" : "all 0.1s linear",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            transform: index === 0 ? getHeadRotation(segments, prevSegments.current) : "none",
                            ...(index === 0 && {
                                backgroundImage: 'url("/images/player.webp")',
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                width: `${segmentSize * 1.2}px`,
                                height: `${segmentSize * 1.2}px`,
                                zIndex: 2,
                            }),
                            boxShadow: index === 0 ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                            backgroundImage: index === 0 ? 'url("/images/player.webp")' : "#4a8f4a",
                            zIndex: index === 0 ? 2 : 1,
                        }}
                    />
                );
            })}
        </>
    );
}

export default Snake;