import React from "react";

const Food = ({ position, gameSize }) => {
  const foodSize = gameSize * 0.05; // 5% of game area

  const style = {
    food: {
      position: "absolute",
      width: `${foodSize}px`,
      height: `${foodSize}px`,
      left: `${position[0]}%`,
      top: `${position[1]}%`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: `${foodSize * 0.8}px`,
    },
  };

  return <div style={style.food}>🍎</div>;
};

export default Food;
