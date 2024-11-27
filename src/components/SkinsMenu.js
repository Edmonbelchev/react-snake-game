import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { skins } from '../config/skins';
import './SkinsMenu.css';

const SkinsMenu = ({ onBack, selectedSkin, onSelectSkin, highScore }) => {
    const { user } = useAuth();

    const handleSkinSelect = (skinId) => {
        if (!user) {
            alert('Please log in to select skins');
            return;
        }

        const skin = skins[skinId];
        if (highScore < skin.requiredScore) {
            alert(`You need ${skin.requiredScore} points to unlock this skin!`);
            return;
        }

        onSelectSkin(skinId);
    };

    const renderPreview = (skinId, skin) => {
        const segments = [
            [17, 25],
            [25, 25],
            [33, 25],
            [41, 25],
            [49, 25],
            [57, 25],
        ];

        return (
            <div className="skin-preview">
                {segments.map((pos, index) => (
                    <div
                        key={index}
                        className={`preview-segment ${skin.starEffect ? 'galaxy-segment' : ''}`}
                        style={{
                            left: `${pos[0]}%`,
                            top: `${pos[1]}%`,
                            backgroundColor: (index === 0 || index === segments.length - 1) ? 'transparent' : (skin.bodyImage ? 'transparent' : skin.color),
                            borderColor: (index === 0 || index === segments.length - 1) ? 'transparent' : skin.borderColor,
                            boxShadow: index === 0 ? 'none' : skin.glowEffect,
                            animation: skin.animation,
                            ...(index === 0 && {
                                backgroundImage: `url(${skin.headImage})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 2,
                                border: 'none',
                                transform: 'rotate(90deg)'
                            }),
                            ...(index !== 0 && skin.bodyImage && {
                                backgroundImage: `url(${skin.bodyImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }),
                            ...(index == segments.length - 1 && skin.tailImage && {
                                backgroundImage: `url(${skin.tailImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }),
                            ...(skin.metalEffect && {
                                backgroundClip: 'padding-box',
                                backdropFilter: 'contrast(1.1) brightness(1.1)'
                            }),
                            ...(skin.pixelEffect && {
                                borderRadius: 0,
                                imageRendering: 'pixelated'
                            }),
                            ...(skin.borderRadius && {
                                borderRadius: skin.borderRadius
                            }),
                            border: index === 0 ? 'none' : `1px solid ${skin.borderColor || '#2e5a2e'}`,
                            zIndex: index === 0 ? 2 : 1
                        }}
                        data-skin={skinId}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="skins-menu">
            <h2>Snake Skins</h2>
            <div className="skins-grid">
                {Object.entries(skins).map(([skinId, skin]) => {
                    const isLocked = highScore < skin.requiredScore;
                    const isSelected = selectedSkin === skinId;

                    return (
                        <div
                            key={skinId}
                            className={`skin-card ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isLocked && handleSkinSelect(skinId)}
                        >
                            {renderPreview(skinId, skin)}
                            <div className="skin-info">
                                <h3>{skin.name}</h3>
                                <p>{skin.description}</p>
                                {isLocked ? (
                                    <div className="unlock-requirement">
                                        Unlocks at {skin.requiredScore} points
                                    </div>
                                ) : (
                                    <div className="unlocked">Unlocked!</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="back-button" onClick={onBack}>
                Back to Menu
            </button>
        </div>
    );
};

export default SkinsMenu;
