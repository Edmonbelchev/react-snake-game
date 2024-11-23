import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Auth/Login';
import Register from './Auth/Register';
import '../styles/Menu.css';

const Menu = ({ onStartGame, onShowLeaderboard, onShowChangelog }) => {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <div className="menu">
        <h1>Snake Game</h1>
        <button className="menu-button" onClick={onStartGame}>
          Start Game
        </button>
        <button className="menu-button" onClick={onShowLeaderboard}>
          Leaderboard
        </button>
        <button className="menu-button" onClick={onShowChangelog}>
          What's New
        </button>
        {user ? (
          <button className="menu-button logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="menu-button" onClick={() => setShowAuth(true)}>
            Login/Register
          </button>
        )}
      </div>

      {showAuth && !user && (
        <div className="modal-overlay">
          {isRegistering ? (
            <Register
              onToggleForm={() => setIsRegistering(false)}
              onClose={() => setShowAuth(false)}
            />
          ) : (
            <Login
              onToggleForm={() => setIsRegistering(true)}
              onClose={() => setShowAuth(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Menu;
