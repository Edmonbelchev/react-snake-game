import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import '../styles/Leaderboard.css';

const ITEMS_PER_PAGE = 10;

const Leaderboard = ({ onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const db = getFirestore();
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const allScores = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(score => score.score > 0);
        
        setScores(allScores);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(scores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentScores = scores.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="leaderboard">
      <h2>Top Players</h2>
      {loading ? (
        <div className="loading">Loading scores...</div>
      ) : (
        <>
          <div className="scores-list">
            {scores.length === 0 ? (
              <div className="no-scores">No scores yet!</div>
            ) : (
              currentScores.map((score, index) => (
                <div key={score.id} className="score-item">
                  <div className="rank">#{startIndex + index + 1}</div>
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
          {scores.length > 0 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      <button className="back-button" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
