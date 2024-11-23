import React from 'react';

const RottenFood = ({ position, gameSize }) => {
    const foodSize = gameSize * 0.05; // 5% of game area
    
    return (
        <div
            style={{
                position: "absolute",
                width: `${foodSize}px`,
                height: `${foodSize}px`,
                backgroundColor: "#8B4513",
                borderRadius: "50%",
                left: `${position[0]}%`,
                top: `${position[1]}%`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                backgroundImage: "radial-gradient(#A0522D, #8B4513)",
                animation: "rottenPulse 2s infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >🦠</div>
    );
};

export default RottenFood;
