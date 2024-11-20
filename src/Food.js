import React from "react";

const Food = ({ position }) => {
  const style = {
    food: {
      position: "absolute",
      width: "5%",
      height: "5%",
      left: `${position[0]}%`,
      top: `${position[1]}%`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  return <div style={style.food}>🍎</div>;
};

export default Food;
