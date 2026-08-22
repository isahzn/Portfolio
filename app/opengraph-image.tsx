import { ImageResponse } from "next/og";

export const alt = "Floza — AI Automation & Software Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image (docs/01_BRAND_GUIDE.MD): dark surface, electric
 * blue → purple gradient wordmark, matching the site's design tokens.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#05060a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow matching the site's radial background */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: "rgba(59,130,246,0.14)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "rgba(139,92,246,0.14)",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "10px 22px",
            color: "#9aa3b2",
            fontSize: 26,
            fontFamily: "Geist, system-ui, sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          AI Automation &amp; Software Studio
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            fontFamily: "Geist, system-ui, sans-serif",
          }}
        >
          {/* Floza */}
          <span style={{ color: "#e8eaf0" }}>Flo</span>
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            za
          </span>
        </div>

        <div
          style={{
            color: "#9aa3b2",
            fontSize: 34,
            fontFamily: "Geist, system-ui, sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          Build smarter workflows with AI.
        </div>
      </div>
    ),
    { ...size },
  );
}
