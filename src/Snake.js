import React, { useRef, useEffect } from 'react';
import { skins } from './config/skins';
import './Snake.css';

const Snake = ({ segments, gameSize, selectedSkin = 'default' }) => {
    const segmentSize = gameSize * 0.05;
    const prevSegments = useRef(segments);
    const currentDirection = useRef(null);
    
    const skinConfig = skins[selectedSkin] || skins.default;

    const getSegmentStyle = (index, segment, isTail) => {
        const isHead = index === 0;
        const baseStyle = {
            position: "absolute",
            width: isHead ? `${segmentSize * 1.2}px` : `${segmentSize}px`,
            height: isHead ? `${segmentSize * 1.2}px` : `${segmentSize}px`,
            backgroundColor: isHead ? "transparent" : skinConfig.color,
            border: isHead ? "none" : `1px solid ${skinConfig.borderColor}`,
            borderRadius: isTail ? "5px 5px 50% 50%" : "10px",
            left: `${segment[0]}%`,
            top: `${segment[1]}%`,
            transition: "all 0.1s linear",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: isHead ? 2 : 1,
        };

        // Apply special effects based on skin type
        if (skinConfig.glowEffect && !isHead) {
            baseStyle.boxShadow = skinConfig.glowEffect;
        }

        if (skinConfig.metalEffect && !isHead) {
            baseStyle.background = skinConfig.color;
            baseStyle.boxShadow = "inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.3)";
        }

        if (skinConfig.pixelEffect && !isHead) {
            baseStyle.borderRadius = "0";
            baseStyle.imageRendering = "pixelated";
        }

        if (skinConfig.starEffect && !isHead) {
            baseStyle.className = "galaxy-segment";
        }

        if (skinConfig.animation && !isHead) {
            baseStyle.animation = skinConfig.animation;
        }

        if (isHead) {
            baseStyle.backgroundImage = `url("${skinConfig.headImage}")`;
            baseStyle.backgroundSize = "contain";
            baseStyle.backgroundPosition = "center";
            baseStyle.backgroundRepeat = "no-repeat";
            baseStyle.transform = getHeadRotation(segments);
        } else if (isTail) {
            baseStyle.transform = getTailRotation(segment, segments[segments.length - 2]);
        }

        return baseStyle;
    };

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

    return (
        <>
            {segments.map((segment, index) => {
                const isTail = index === segments.length - 1;
                const style = getSegmentStyle(index, segment, isTail);
                
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