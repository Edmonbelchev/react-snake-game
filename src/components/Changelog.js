import React from 'react';
import './Changelog.css';

const Changelog = ({ onClose }) => {
    const features = [
        {
            title: "Wall Passing",
            description: "Snake can now pass through walls and appear on the opposite side!",
            icon: "🌟",
            type: "feature"
        },
        {
            title: "Rotten Apples",
            description: "Watch out for these poisonous treats! They appear for 10 seconds and will cost you 2 points if eaten.",
            icon: "🦠",
            type: "danger"
        },
        {
            title: "Enhanced Power-ups",
            description: "Power-ups now have a 50% chance to appear every 10 points. The shrink power-up is more effective on longer snakes!",
            icon: "💫",
            type: "improvement"
        },
        {
            title: "Game Over Changes",
            description: "The game now ends when the snake bites itself - no second chances!",
            icon: "🎯",
            type: "change"
        },
        {
            title: "Visual Improvements",
            description: "Smooth animations for wall crossing and improved snake head rotation mechanics.",
            icon: "🎨",
            type: "visual"
        }
    ];

    return (
        <div className="changelog-container">
            <div className="changelog-header">
                <div className="version-badge">v1.1.0</div>
                <h2>Game Enhancement Update</h2>
                <p className="release-date">Released: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="features-grid">
                {features.map((feature, index) => (
                    <div 
                        key={index} 
                        className={`feature-card ${feature.type}`}
                        style={{
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        <div className="feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Changelog;
