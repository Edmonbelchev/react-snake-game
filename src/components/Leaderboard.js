import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import '../styles/Leaderboard.css';

const Leaderboard = ({ onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const db = getFirestore();
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'));
        const querySnapshot = await getDocs(q);
        
        // Create a map to store highest score per user
        const userHighScores = new Map();
        
        querySnapshot.docs.forEach(doc => {
          const scoreData = doc.data();
          const userId = scoreData.userId;
          const existingScore = userHighScores.get(userId);
          
          if (!existingScore || scoreData.score > existingScore.score) {
            userHighScores.set(userId, {
              id: doc.id,
              ...scoreData
            });
          }
        });
        
        // Convert map to array and sort by score
        const highestScores = Array.from(userHighScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Only show top 10
        
        setScores(highestScores);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="leaderboard">
      <h2>Top Players</h2>
      {loading ? (
        <div className="loading">Loading scores...</div>
      ) : (
        <div className="scores-list">
          {scores.length === 0 ? (
            <div className="no-scores">No scores yet!</div>
          ) : (
            scores.map((score, index) => (
              <div key={score.id} className="score-item">
                <div className="rank">#{index + 1}</div>
                <div className="player-info">
                  <img 
                    src={score.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(score.userName || 'Anonymous')}&background=random`} 
                    alt="avatar"
                    className="player-avatar"
                  />
                  <span className="player-name">{score.userName || 'Anonymous'}</span>
                </div>
                <div className="score-value">{score.score}</div>
              </div>
            ))
          )}
        </div>
      )}
      <button className="back-button" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
