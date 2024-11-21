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

function App() {
  const [segments, setSegments] = useState([[50, 50]]);
  const [direction, setDirection] = useState([0, 0]);
  const [food, setFood] = useState([25, 25]);
  const [score, setScore] = useState(0);
  const [speed] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [actualDirection, setActualDirection] = useState([0, 0]);
  const directionRef = useRef([0, 0]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const hideTimeoutRef = useRef(null);
  // const soundsRef = useRef({
  //   eat: new Audio("public/sounds/eat.mp3"),
  //   collision: new Audio("public/sounds/collision.mp3"),
  //   gameOver: new Audio("public/sounds/gameOver.mp3"),
  // });
  const { user, signInWithGoogle, signOut } = useAuth();
  const [highScores, setHighScores] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Get game size from localStorage or default to medium
  const [gameSize, setGameSize] = useState(() => {
    return localStorage.getItem("gameSize") || "medium";
  });

  // Calculate game dimensions based on size
  const getGameDimensions = () => {
    switch (gameSize) {
      case "small":
        return { width: 400, height: 400 };
      case "large":
        return { width: 600, height: 600 };
      default: // medium
        return { width: 500, height: 500 };
    }
  };

  const style = {
    gameArea: {
      position: "relative",
      ...getGameDimensions(),
      backgroundColor: "#90EE90",
      backgroundImage:
        "linear-gradient(#85e085 1px, transparent 1px), linear-gradient(90deg, #85e085 1px, transparent 1px)",
      backgroundSize: "25px 25px",
      border: "2px solid #458245",
      margin: "20px auto",
    },
    header: {
      backgroundColor: "#458245",
      padding: "10px 20px",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
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
    },
  };

  // Initialize sounds and set initial volume
  // useEffect(() => {
  //   const sounds = soundsRef.current;
  //   Object.values(sounds).forEach((sound) => {
  //     sound.volume = isMuted ? 0 : volume;
  //   });
  // }, [volume, isMuted]);

  // Sound playing function
  // const playSound = (soundName) => {
  //   if (!isMuted && soundsRef.current[soundName]) {
  //     const sound = soundsRef.current[soundName];
  //     sound.currentTime = 0;
  //     sound.volume = volume;
  //     const playPromise = sound.play();
  //     if (playPromise) {
  //       playPromise.catch((error) => console.log("Sound play error:", error));
  //     }
  //   }
  // };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
  }, [direction, food, speed, isGameOver, isMuted]);

  const resetGame = () => {
    setSegments([[50, 50]]);
    setDirection([0, 0]);
    directionRef.current = [0, 0];
    setFood(generateFood());
    setScore(0);
    setIsGameOver(false);
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowVolumeSlider(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
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
        limit(10)
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

  // Update game area size when gameSize changes
  useEffect(() => {
    const dimensions = getGameDimensions();
    // Update any game logic that depends on size
    // You might need to adjust snake speed, food position, etc.
  }, [gameSize]);

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
        <Snake segments={segments} />
        <Food position={food} />
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
            <p>Press Enter to restart</p>
          </div>
        )}
      </div>

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

