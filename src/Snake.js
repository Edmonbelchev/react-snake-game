import React, { useRef, useEffect } from 'react';
import { skins } from './config/skins';
import './Snake.css';

const Snake = ({ segments, gameSize, selectedSkin = 'default' }) => {
    const segmentSize = gameSize * 0.05;
    const prevSegments = useRef(segments);
    const currentDirection = useRef(null);
    
    const skinConfig = skins[selectedSkin] || skins.default;

    const isWallCrossing = (currentPos, prevPos) => {
        if (!prevPos) return false;
        return Math.abs(currentPos[0] - prevPos[0]) > 45 || 
               Math.abs(currentPos[1] - prevPos[1]) > 45;
    };

    const getHeadRotation = (segments) => {
        if (segments.length < 2) return 'rotate(-90deg)';
        
        const [head] = segments;
        const prevHead = prevSegments.current[0];
        
        if (isWallCrossing(head, prevHead) && currentDirection.current) {
            const { dx, dy } = currentDirection.current;
            if (dx > 0) return 'rotate(-90deg)';
            if (dx < 0) return 'rotate(90deg)';
            if (dy > 0) return 'rotate(0deg)';
            if (dy < 0) return 'rotate(180deg)';
        }
        
        const [, neck] = segments;
        const dx = head[0] - neck[0];
        const dy = head[1] - neck[1];
        
        if (dx > 0) return 'rotate(-90deg)';
        if (dx < 0) return 'rotate(90deg)';
        if (dy > 0) return 'rotate(0deg)';
        return 'rotate(180deg)';
    };

    const getTailRotation = (tail, prevTail) => {
        const dx = tail[0] - prevTail[0];
        const dy = tail[1] - prevTail[1];
        
        if (dx > 0) return 'rotate(90deg)';
        if (dx < 0) return 'rotate(-90deg)';
        if (dy > 0) return 'rotate(180deg)';
        if (dy < 0) return 'rotate(0deg)';
        
        return 'rotate(0deg)';
    };

    useEffect(() => {
        if (segments.length >= 2) {
            const [head, neck] = segments;
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

    const getSegmentStyle = (index, segment, isTail) => {
        const isHead = index === 0;
        const baseStyle = {
            position: "absolute",
            width: isHead ? `${segmentSize * 1.2}px` : `${segmentSize}px`,
            height: isHead ? `${segmentSize * 1.2}px` : `${segmentSize}px`,
            backgroundColor: isHead ? "transparent" : "transparent",
            border: isHead ? "none" : "none",
            borderRadius: isTail ? "5px 5px 50% 50%" : "0",
            left: `${segment[0]}%`,
            top: `${segment[1]}%`,
            transition: "all 0.1s linear",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: isHead ? 2 : 1,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        };

        if (isHead) {
            baseStyle.backgroundImage = `url("${skinConfig.headImage}")`;
            baseStyle.transform = getHeadRotation(segments);
        } else if (isTail) {
            baseStyle.backgroundColor = skinConfig.color || '#4a8f4a';
            baseStyle.border = `1px solid ${skinConfig.borderColor || '#2e5a2e'}`;
            baseStyle.transform = getTailRotation(segment, segments[segments.length - 2]);
            if (skinConfig.glowEffect) {
                baseStyle.boxShadow = skinConfig.glowEffect;
            }
        } else if (skinConfig.bodyImage) {
            baseStyle.backgroundImage = `url("${skinConfig.bodyImage}")`;
        } else {
            baseStyle.backgroundColor = skinConfig.color || '#4a8f4a';
            baseStyle.border = `1px solid ${skinConfig.borderColor || '#2e5a2e'}`;
            if (skinConfig.glowEffect) {
                baseStyle.boxShadow = skinConfig.glowEffect;
            }
        }

        return baseStyle;
    };

    return (
        <>
            {segments.map((segment, index) => {
                const isTail = index === segments.length - 1;
                const style = getSegmentStyle(index, segment, isTail);

                const prevSegment = prevSegments.current[index];
                const crossing = isWallCrossing(segment, prevSegment);
                
                style.transition = crossing ? "none" : "all 0.1s linear";
                
                return (
                    <div
                        key={index}
                        style={style}
                        className={skinConfig.starEffect && index !== 0 ? 'galaxy-segment' : ''}
                    />
                );
            })}
        </>
    );
};

export default Snake;