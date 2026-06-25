import React from "react";

const CircleLoader = ({ size = "64px", meshColor = "#6366F1" }) => {
  const s = parseInt(size);
  const ring = (scale, delay, opacity) => ({
    width:  s * scale,
    height: s * scale,
    border: `${Math.max(2, s * 0.05)}px solid transparent`,
    borderTopColor: meshColor,
    borderRadius: "50%",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    opacity,
    animation: `portify-spin 1.2s linear ${delay} infinite`,
  });

  return (
    <div style={{ position: "relative", width: s, height: s, display: "inline-block" }}>
      <style>{`@keyframes portify-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }`}</style>
      <div style={ring(1,    "0s",   1)} />
      <div style={ring(0.72, "-0.4s", 0.7)} />
      <div style={ring(0.44, "-0.8s", 0.4)} />
    </div>
  );
};

export default CircleLoader;
