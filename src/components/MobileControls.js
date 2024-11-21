import React from "react";
import "../styles/mobileControls.css";

const MobileControls = ({ onDirectionChange }) => {
  return (
    <div className="mobile-controls">
      <div className="controls-row">
        <button
          className="control-button"
          onClick={() => onDirectionChange("up")}
        >
          ↑
        </button>
      </div>
      <div className="controls-row">
        <button
          className="control-button"
          onClick={() => onDirectionChange("left")}
        >
          ←
        </button>
        <button
          className="control-button"
          onClick={() => onDirectionChange("down")}
        >
          ↓
        </button>
        <button
          className="control-button"
          onClick={() => onDirectionChange("right")}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
