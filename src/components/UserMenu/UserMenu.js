import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserMenu.css';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-menu-container">
      <div className="user-info" onClick={() => setShowMenu(!showMenu)}>
        {user.photoURL && !imgError ? (
          <img 
            src={user.photoURL} 
            alt="User" 
            className="user-avatar" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="initials-avatar">
            {getInitials(user.displayName)}
          </div>
        )}
        <span className="user-name">{user.displayName}</span>
      </div>

      {showMenu && (
        <div className="menu-dropdown">
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}
