import React from 'react';

const Snake = ({ segments, gameSize }) => {
    const segmentSize = gameSize * 0.05; // 5% of game area

    return (
        <>
            {segments.map((segment, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        width: `${segmentSize}px`,
                        height: `${segmentSize}px`,
                        backgroundColor: '#4A90E2',
                        border: '1px solid #3B78C1',
                        borderRadius: '5px',
                        left: `${segment[0]}%`,
                        top: `${segment[1]}%`,
                        transition: 'all 0.1s linear'
                    }}
                />
            ))}
        </>
    );
}

export default Snake; 