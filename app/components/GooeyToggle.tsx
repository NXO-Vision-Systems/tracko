"use client";

import { useRef, useEffect, useState } from "react";

interface GooeyToggleProps {
  segments: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

export default function GooeyToggle({ segments, value, onChange }: GooeyToggleProps) {
  const activeIndex = segments.findIndex((s) => s.value === value);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<unknown>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate segment width percentage
  const segmentPercent = 100 / segments.length;

  useEffect(() => {
    const styleId = "shader-canvas-style-toggle";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-toggle canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: inherit !important;
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");

        if (shaderRef.current && !shaderMount.current) {
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 0,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6
          );
        }
      } catch (error) {
        console.error("[GooeyToggle] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mount = shaderMount.current as any;
      if (mount?.destroy) {
        mount.destroy();
        shaderMount.current = null;
      }
    };
  }, []);

  // Speed up shader on hover
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mount = shaderMount.current as any;
    if (mount?.setSpeed) {
      mount.setSpeed(isHovered ? 1.2 : 0.6);
    }
  }, [isHovered]);

  const handleClick = (index: number, val: string) => {
    // Burst animation on click
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mount = shaderMount.current as any;
    if (mount?.setSpeed) {
      mount.setSpeed(2.4);
      setTimeout(() => {
        if (mount?.setSpeed) {
          mount.setSpeed(isHovered ? 1.2 : 0.6);
        }
      }, 300);
    }
    onChange(val);
  };

  return (
    <div style={{ margin: "0 20px 16px" }}>
      <div
        style={{
          position: "relative",
          borderRadius: 999,
          height: 42,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          background: "#0a0a0a",
          boxShadow: isHovered
            ? "0px 0px 0px 1px rgba(0,0,0,0.4), 0px 12px 6px 0px rgba(0,0,0,0.05), 0px 8px 5px 0px rgba(0,0,0,0.1), 0px 4px 4px 0px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.2)"
            : "0px 0px 0px 1px rgba(0,0,0,0.3), 0px 20px 12px 0px rgba(0,0,0,0.08), 0px 9px 9px 0px rgba(0,0,0,0.12), 0px 2px 5px 0px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Liquid Metal Shader Background */}
        <div
          ref={shaderRef}
          className="shader-container-toggle"
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: 3,
            bottom: 3,
            borderRadius: 999,
            overflow: "hidden",
            opacity: 0.7,
            zIndex: 1,
            width: "calc(100% - 6px)",
            height: "calc(100% - 6px)"
          }}
        />

        {/* Inner dark overlay for depth */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: 3,
            bottom: 3,
            borderRadius: 999,
            background: "linear-gradient(180deg, rgba(20,20,20,0.4) 0%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Sliding Metallic Pill */}
        <div
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: 0,
            width: `${segmentPercent}%`,
            padding: "0 3px",
            boxSizing: "border-box",
            transform: `translateX(${activeIndex * 100}%)`,
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 50%, #909090 100%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
              position: "relative",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ position: "relative", display: "flex", height: "100%", zIndex: 10 }}>
          {segments.map((seg, i) => (
            <button
              key={seg.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClick(i, seg.value);
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: value === seg.value ? 700 : 500,
                color: value === seg.value ? "#1a1a1a" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "color 0.3s ease",
                background: "transparent",
                border: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
