import React from 'react';

const Snake = ({ segments }) => {
    return (
        <>
            {segments.map((segment, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        width: '5%',
                        height: '5%',
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