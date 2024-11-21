import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Snake from "./Snake";
import Food from "./Food";
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserMenu from './components/UserMenu/UserMenu';
import './styles/auth.css';
import './styles/userMenu.css';
import useWindowDimensions from './hooks/useWindowDimensions';
import MobileControls from './components/MobileControls';

function App() {
  const [segments, setSegments] = useState([[50, 50]]);
  const [direction, setDirection] = useState([0, 0]);
  const [food, setFood] = useState([25, 25]);
  const [score, setScore] = useState(0);
  const [speed] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const directionRef = useRef([0, 0]);
  const hideTimeoutRef = useRef(null);
  const { user } = useAuth();
  const [highScores, setHighScores] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const gameSize = isMobile ? Math.min(width * 0.9, 400) : 500;

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

  // Check if snake ate food
  const checkFoodCollision = (head, food) => {
    return Math.abs(head[0] - food[0]) < 5 && Math.abs(head[1] - food[1]) < 5;
  };

  // Check wall collision
  const checkWallCollision = (head) => {
    return head[0] < 0 || head[0] > 95 || head[1] < 0 || head[1] > 95;
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
          // playSound("gameOver");
          setIsGameOver(true);
          return currentSegments;
        }

        // Check self collision
        const collisionIndex = checkSelfCollision(head, currentSegments);
        if (collisionIndex !== -1 && currentSegments.length >= 5) {
          // playSound("collision");
          const removedSegments = currentSegments.length - collisionIndex;
          setScore(prevScore => Math.max(0, prevScore - removedSegments)); // Reduce score based on removed segments
          const newSegments = currentSegments.slice(0, collisionIndex);
          return [head, ...newSegments.slice(0, -1)];
        }

        // Check if snake ate food
        if (checkFoodCollision(head, food)) {
          // playSound("eat");
          setFood(generateFood());
          setScore((prev) => prev + 1);
          return [head, ...currentSegments];
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Function to save score to Firebase
  const saveScore = async (score) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "scores"), {
        userId: user.uid,
        userName: user.displayName,
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
      const q = query(
        collection(db, "scores"),
        orderBy("score", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
      // playSound("gameOver");
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
      <div style={style.header}>
        <div className="scores">
          <div>Current Score: 🍎 {score}</div>
          <div>High Score: 🏆 {highScores[0]?.score || 0}</div>
        </div>

        {user ? (
          <UserMenu />
        ) : (
          <button style={style.authButton} onClick={() => setShowAuth(true)}>
            Sign In
          </button>
        )}
      </div>

      <div style={style.gameArea}>
        <Snake segments={segments} gameSize={gameSize} />
        <Food position={food} gameSize={gameSize} />
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
          </div>
        )}
      </div>

      {isMobile && !isGameOver && (
        <MobileControls onDirectionChange={handleMobileControl} />
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

