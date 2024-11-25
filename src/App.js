import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Snake from "./Snake";
import Food from "./Food";
import RottenFood from "./RottenFood";
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, addDoc, query, orderBy,  getDocs } from 'firebase/firestore';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Menu from './components/Menu';
import Leaderboard from './components/Leaderboard';
import Changelog from './components/Changelog';
import './styles/auth.css';
import './styles/userMenu.css';
import useWindowDimensions from './hooks/useWindowDimensions';
import MobileControls from './components/MobileControls';
import SkinsMenu from './components/SkinsMenu';

function App() {
  const [segments, setSegments] = useState([[50, 50]]);
  const [direction, setDirection] = useState([0, 0]);
  const [food, setFood] = useState([25, 25]);
  const [rottenFood, setRottenFood] = useState(null);
  const [score, setScore] = useState(0);
  const [speed] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const directionRef = useRef([0, 0]);
  const hideTimeoutRef = useRef(null);
  const rottenFoodTimerRef = useRef(null);
  const { user } = useAuth();
  const [highScores, setHighScores] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const gameSize = isMobile ? Math.min(width * 0.9, 400) : 500;
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'game', or 'leaderboard'
  const [powerUp, setPowerUp] = useState(null);
  const [powerUpActive, setPowerUpActive] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(null);
  const [selectedSkin, setSelectedSkin] = useState('default');

  const powerUps = {
    DOUBLE_SCORE: {
      symbol: "🍏",
      duration: 20000, // 20 seconds
      effect: "2x Points!"
    },
    SHIELD: {
      symbol: "🛡️",
      duration: 8000, // 8 seconds
      effect: "Shield Active!"
    },
    SHRINK: {
      symbol: "📏",
      duration: 0, // instant effect
      effect: "Snake Shrunk!"
    }
  };

  const style = {
    gameArea: {
      position: "relative",
      width: `${gameSize}px`,
      height: `${gameSize}px`,
      backgroundColor: "#90EE90",
      backgroundImage:
        "linear-gradient(#85e085 1px, transparent 1px), linear-gradient(90deg, #85e085 1px, transparent 1px)",
      backgroundSize: "25px 25px",
      border: "2px solid #458245",
      margin: "20px auto",
    },
    header: {
      backgroundColor: "#458245",
      padding: isMobile ? "5px 10px" : "10px 20px",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: isMobile ? "14px" : "16px",
      maxWidth: "500px",
      margin: "0 auto",
    },
    authButton: {
      backgroundColor: "#4CAF50",
      border: "none",
      color: "white",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    gameOver: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "20px",
      borderRadius: "10px",
      textAlign: "center",
      width: isMobile ? "80%" : "auto",
      zIndex: 999
    },
    restartButton: {
      backgroundColor: "#4CAF50",
      border: "none",
      color: "white",
      padding: "15px 30px",
      borderRadius: "25px",
      fontSize: "18px",
      marginTop: "15px",
      cursor: "pointer",
      width: isMobile ? "100%" : "auto",
      touchAction: "manipulation",
    }
  };

  // Generate random food position
  const generateFood = () => {
    const newFood = [
      Math.floor(Math.random() * 19) * 5,
      Math.floor(Math.random() * 19) * 5,
    ];
    return newFood;
  };

  // Generate rotten food and set timer to remove it
  const spawnRottenFood = () => {
    if (Math.random() < 0.03) { // 3% chance to spawn rotten food
      const newRottenFood = [
        Math.floor(Math.random() * 19) * 5,
        Math.floor(Math.random() * 19) * 5,
      ];
      setRottenFood(newRottenFood);
      
      // Clear previous timer if exists
      if (rottenFoodTimerRef.current) {
        clearTimeout(rottenFoodTimerRef.current);
      }
      
      // Remove rotten food after 10 seconds
      rottenFoodTimerRef.current = setTimeout(() => {
        setRottenFood(null);
      }, 10000);
    }
  };

  // Check if snake ate food
  const checkFoodCollision = (head, foodPos) => {
    return Math.abs(head[0] - foodPos[0]) < 5 && Math.abs(head[1] - foodPos[1]) < 5;
  };

  // Check wall collision and wrap position
  const checkWallCollision = (head) => {
    if (head[0] < 0) {
      head[0] = 95;
    } else if (head[0] > 95) {
      head[0] = 0;
    }
    
    if (head[1] < 0) {
      head[1] = 95;
    } else if (head[1] > 95) {
      head[1] = 0;
    }
    
    return false;
  };

  // Check self collision and return collision index
  const checkSelfCollision = (head, segments) => {
    if (segments.length >= 5) {
      for (let i = 1; i < segments.length; i++) {
        if (
          Math.abs(head[0] - segments[i][0]) < 5 &&
          Math.abs(head[1] - segments[i][1]) < 5
        ) {
          return i;
        }
      }
    }
    return -1;
  };

  const getNewDirection = (key) => {
    switch (key) {
      case "ArrowUp":
      case "w":
        return [0, -1];
      case "ArrowDown":
      case "s":
        return [0, 1];
      case "ArrowLeft":
      case "a":
        return [-1, 0];
      case "ArrowRight":
      case "d":
        return [1, 0];
      default:
        return null;
    }
  };

  const isValidDirectionChange = (newDir, currentDir) => {
    // If no current direction, any direction is valid
    if (currentDir[0] === 0 && currentDir[1] === 0) return true;

    // Cannot move in opposite direction on same axis
    if (currentDir[0] !== 0) {
      return newDir[0] === 0; // Only allow vertical movement if moving horizontally
    } else {
      return newDir[1] === 0; // Only allow horizontal movement if moving vertically
    }
  };

  const spawnPowerUp = () => {
    if (Math.random() < 0.5 && !powerUp) { // 5% chance to spawn
      const powerUpTypes = Object.keys(powerUps);
      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      // Generate random position within game bounds
      const x = Math.floor(Math.random() * 19) * 5;
      const y = Math.floor(Math.random() * 19) * 5;
      
      // Check if position conflicts with snake or food
      const conflicts = segments.some(([sx, sy]) => sx === x && sy === y) || 
                       (food[0] === x && food[1] === y);
      
      if (!conflicts) {
        setPowerUp({ type: randomType, position: [x, y] });
      }
    }
  };

  const activatePowerUp = (type) => {
    setPowerUpActive(type);
    setPowerUp(null);

    // Clear existing timer
    if (powerUpTimer) {
      clearTimeout(powerUpTimer);
    }

    // Handle instant effects
    if (type === 'SHRINK') {
      if (segments.length > 5 && segments.length < 20) {
        setSegments(prev => prev.slice(0, -3)); // Remove last 3 segments
      } else if (segments.length > 20) {
        setSegments(prev => prev.slice(0, -10)); // Remove last 10 segments
      }
      setPowerUpActive(null);
      return;
    }

    // Set timer for duration-based power-ups
    const timer = setTimeout(() => {
      setPowerUpActive(null);
    }, powerUps[type].duration);
    setPowerUpTimer(timer);
  };

  const checkPowerUpCollision = (head, powerUp) => {
    if (!powerUp) return false;
    return head[0] === powerUp.position[0] && head[1] === powerUp.position[1];
  };

  useEffect(() => {
    // Force spawn a power-up at start
    if (!powerUp) {
      setPowerUp({
        type: 'SHIELD',
        position: [25, 25]
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) {
        if (e.key === "Enter") {
          resetGame();
          return;
        }
      }

      const newDir = getNewDirection(e.key);
      if (!newDir) return;

      if (isValidDirectionChange(newDir, directionRef.current)) {
        setDirection(newDir);
      }
    };

    const gameLoop = setInterval(() => {
      if (isGameOver) return;

      setSegments((currentSegments) => {
        const head = [...currentSegments[0]];

        directionRef.current = direction;
        head[0] += direction[0] * speed;
        head[1] += direction[1] * speed;

        // Check wall collision
        if (checkWallCollision(head)) {
          setIsGameOver(true);
          return currentSegments;
        }

        // Check for power-up collision
        if (powerUp && checkPowerUpCollision(head, powerUp)) {
          console.log('Power-up collected!');
          activatePowerUp(powerUp.type);
        }

        // Check self collision - skip penalty if shield is active
        const collisionIndex = checkSelfCollision(head, currentSegments);
        if (collisionIndex !== -1 && currentSegments.length >= 5) {
          if (powerUpActive !== 'SHIELD') {
            setIsGameOver(true);
            return currentSegments;
          }
          // With shield, just continue through the collision
          console.log('Shield protected from self collision!');
        }

        // Check if snake ate food
        if (checkFoodCollision(head, food)) {
          setFood(generateFood());
          setScore((prev) => prev + (powerUpActive === 'DOUBLE_SCORE' ? 2 : 1));
          
          // Try spawning power-up and rotten food
          if (score > 0 && score % 10 === 0) {
            spawnPowerUp();
          }
          spawnRottenFood();
          
          return [head, ...currentSegments];
        }

        // Check if snake ate rotten food
        if (rottenFood && checkFoodCollision(head, rottenFood)) {
          setRottenFood(null);
          setScore((prev) => Math.max(0, prev - 2)); // Prevent negative score
          if (rottenFoodTimerRef.current) {
            clearTimeout(rottenFoodTimerRef.current);
          }
          return [head, ...currentSegments.slice(0, -1)];
        }

        return [head, ...currentSegments.slice(0, -1)];
      });
    }, 100);

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [direction, food, speed, isGameOver]);

  const resetGame = () => {
    setSegments([[50, 50]]);
    setDirection([0, 0]);
    directionRef.current = [0, 0];
    setFood(generateFood());
    setScore(0);
    setIsGameOver(false);
  };

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (rottenFoodTimerRef.current) {
        clearTimeout(rottenFoodTimerRef.current);
      }
    };
  }, []);

  // Function to save score to Firebase
  const saveScore = async (score) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "scores"), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        score: score,
        timestamp: new Date(),
      });
      await loadHighScores();
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  // Function to load high scores
  const loadHighScores = async () => {
    try {
      // Create a map to store highest score per user
      const userHighScores = new Map();
      
      const q = query(
        collection(db, "scores"),
        orderBy("score", "desc")
      );
      const querySnapshot = await getDocs(q);
      
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
      const scores = Array.from(userHighScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      setHighScores(scores);
    } catch (error) {
      console.error("Error loading high scores:", error);
    }
  };

  // Load high scores on component mount
  useEffect(() => {
    loadHighScores();
  }, []);

  // Update game over handling
  useEffect(() => {
    if (isGameOver) {
      saveScore(score);
    }
  }, [isGameOver]);

  // Add handler for mobile controls
  const handleMobileControl = (direction) => {
    if (isGameOver) return;
    
    const directionMap = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    const newDir = directionMap[direction];
    if (isValidDirectionChange(newDir, directionRef.current)) {
      setDirection(newDir);
    }
  };

  return (
    <div>
      {currentView === 'menu' && (
        <Menu
          onStartGame={() => {
            resetGame();
            setCurrentView('game');
          }}
          onShowLeaderboard={() => setCurrentView('leaderboard')}
          onShowChangelog={() => setCurrentView('changelog')}
          onShowSkins={() => setCurrentView('snake-skins')}
        />
      )}

      {currentView === 'leaderboard' && (
        <Leaderboard onBack={() => setCurrentView('menu')} />
      )}

      {currentView === 'snake-skins' && (
        <SkinsMenu
          onBack={() => setCurrentView('menu')}
          selectedSkin={selectedSkin}
          onSelectSkin={setSelectedSkin}
          highScore={highScores[0]?.score || 0}
        />
      )}

      {currentView === 'changelog' && (
        <div className="menu-container">
          <div className="page-header">
            <button 
              className="back-button" 
              onClick={() => setCurrentView('menu')}
            >
              ← Back
            </button>
            <h1 className="page-title">What's New</h1>
          </div>
          <Changelog onClose={() => setCurrentView('menu')} />
        </div>
      )}

      {currentView === 'game' && (
        <>
          <div style={style.header}>
            <div className="scores">
              <div>Current Score: 🍎 {score}</div>
              <div>High Score: 🏆 {highScores[0]?.score || 0}</div>
              {powerUpActive && (
                <div style={{
                  marginLeft: "24px",
                  color: "#61dafb",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }} className="power-up-effect">
                  {powerUps[powerUpActive].symbol} {powerUps[powerUpActive].effect}
                </div>
              )}
            </div>

            <button 
              style={style.authButton} 
              onClick={() => setCurrentView('menu')}
            >
              Menu
            </button>
          </div>

          <div style={style.gameArea}>
            <Snake 
              segments={segments} 
              gameSize={gameSize}
              selectedSkin={selectedSkin}
            />
            <Food position={food} gameSize={gameSize} />
            {rottenFood && <RottenFood position={rottenFood} gameSize={gameSize} />}
            {powerUp && (
              <div 
                className="power-up"
                style={{
                  position: "absolute",
                  left: `${powerUp.position[0] * (gameSize/100)}px`,
                  top: `${powerUp.position[1] * (gameSize/100)}px`,
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#61dafb",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {powerUps[powerUp.type].symbol}
              </div>
            )}
            {isGameOver && (
              <div style={style.gameOver}>
                <h2>Game Over!</h2>
                <p>Score: {score}</p>
                {!user && <p>Sign in to save your score!</p>}
                <div style={{ marginTop: "20px" }}>
                  <h3>High Scores</h3>
                  {highScores.map((score, index) => (
                    <div key={score.id}>
                      {index + 1}. {score.userName}: {score.score}
                    </div>
                  ))}
                </div>
                {isMobile ? (
                  <button 
                    style={style.restartButton}
                    onClick={resetGame}
                  >
                    Tap to Restart
                  </button>
                ) : (
                  <p>Press Enter to restart</p>
                )}
                <button 
                  style={{...style.restartButton, marginTop: '10px'}}
                  onClick={() => setCurrentView('menu')}
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>

          {isMobile && !isGameOver && (
            <MobileControls onDirectionChange={handleMobileControl} />
          )}
        </>
      )}

      {showAuth && (
        <div style={style.modal}>
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
    </div>
  );
}
export default App;
