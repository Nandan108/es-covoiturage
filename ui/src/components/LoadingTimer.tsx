import type { CSSProperties, ReactNode } from "react";
import "./LoadingTimer.css"

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export type LoadingTimerProps = {
  value?: number;
  duration?: number;
  size?: number | string;
  thickness?: number | string;
  color?: string;
  backgroundColor?: string;
  paused?: boolean;
  children?: ReactNode;
  className?: string;
};

const DEFAULT_SIZE = 36;

export default function LoadingTimer({
  value,
  duration = 4000,
  thickness = 2,
  color = "#22c55e",
  backgroundColor = "rgba(255,255,255,0.3)",
  paused = false,
  children,
  className,
}: LoadingTimerProps) {
  const controlled = typeof value === "number" && !Number.isNaN(value);
  const numericThickness = typeof thickness === "number" ? thickness : parseFloat(String(thickness));
  const radius = (DEFAULT_SIZE / 2) - numericThickness / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(value ?? 0, 0, 1);

const circleStyle = {
    strokeDasharray: `${circumference} ${circumference}`,
    stroke: color,
    strokeDashoffset: controlled ? `${circumference * (1 - progress)}` : `${circumference}`,
    strokeWidth: numericThickness,
    animationDuration: `${duration}ms`,
    animationPlayState: paused ? "paused" : undefined,
    "--timer-circumference": circumference,
  } as CSSProperties & { "--timer-circumference"?: number };

  const classes = ["loading-timer"];
  const progressClasses = ["loading-timer__progress"];
  if (!controlled) progressClasses.push("loading-timer__progress--animated");
  if (className) classes.push(className);

  return (
    <span className={classes.join(" ")} aria-hidden>
      <svg className="loading-timer__svg" viewBox={`0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`}>
        <circle
          className="loading-timer__track"
          cx={DEFAULT_SIZE / 2}
          cy={DEFAULT_SIZE / 2}
          r={radius}
          strokeWidth={numericThickness}
          stroke={backgroundColor}
          fill="none"
        />
        <circle
          className={progressClasses.join(" ")}
          cx={DEFAULT_SIZE / 2}
          cy={DEFAULT_SIZE / 2}
          r={radius}
          fill="none"
          style={circleStyle}
        />
      </svg>
      {children}
    </span>
  );
}
