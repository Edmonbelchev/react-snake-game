import React, { useRef, useEffect } from 'react';

const Snake = ({ segments, gameSize }) => {
    const segmentSize = gameSize * 0.05; // 5% of game area
    const prevSegments = useRef(segments);
    const currentDirection = useRef(null);

    useEffect(() => {
        if (segments.length >= 2) {
            const [head, neck] = segments;
            // Only update direction if not crossing wall
            if (!isWallCrossing(head, prevSegments.current[0])) {
                const dx = head[0] - neck[0];
                const dy = head[1] - neck[1];
                if (dx !== 0 || dy !== 0) {
                    currentDirection.current = { dx, dy };
                }
            }
        }
        prevSegments.current = segments;
    }, [segments]);

    const isWallCrossing = (currentPos, prevPos) => {
        if (!prevPos) return false;
        return Math.abs(currentPos[0] - prevPos[0]) > 45 || 
               Math.abs(currentPos[1] - prevPos[1]) > 45;
    };

    const getHeadRotation = (segments) => {
        if (segments.length < 2) return 'rotate(-90deg)';
        
        const [head] = segments;
        const prevHead = prevSegments.current[0];
        
        // If crossing wall, use stored direction
        if (isWallCrossing(head, prevHead) && currentDirection.current) {
            const { dx, dy } = currentDirection.current;
            if (dx > 0) return 'rotate(-90deg)';
            if (dx < 0) return 'rotate(90deg)';
            if (dy > 0) return 'rotate(0deg)';
            if (dy < 0) return 'rotate(180deg)';
        }
        
        // Normal movement
        const [, neck] = segments;
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