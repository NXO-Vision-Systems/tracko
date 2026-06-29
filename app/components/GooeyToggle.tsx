"use client";

interface GooeyToggleProps {
  segments: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

export default function GooeyToggle({ segments, value, onChange }: GooeyToggleProps) {
  const activeIndex = segments.findIndex((s) => s.value === value);

  // Calculate segment width percentage
  const segmentPercent = 100 / segments.length;

  const handleClick = (val: string) => {
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
          boxShadow: "0 12px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Static metallic background avoids keeping a WebGL canvas alive. */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: 3,
            bottom: 3,
            borderRadius: 999,
            background: "linear-gradient(115deg, #171717 0%, #383838 28%, #111 54%, #2b2b2b 78%, #0b0b0b 100%)",
            opacity: 0.82,
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
          {segments.map((seg) => (
            <button
              key={seg.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClick(seg.value);
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
