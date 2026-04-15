import { ImageResponse } from "next/og";

export const alt = "mktIQ — Ontario Neighbourhood Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d1117",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: "#0f766e",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#0f766e", letterSpacing: "-0.5px" }}>
          mktIQ
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#ffffff", lineHeight: 1.05, letterSpacing: "-1.5px" }}>
            Ontario Neighbourhood
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#0f766e", lineHeight: 1.05, letterSpacing: "-1.5px" }}>
            Intelligence.
          </div>
          <div style={{ marginTop: 28, fontSize: 22, color: "#94a3b8", lineHeight: 1.5, maxWidth: 680 }}>
            Compare neighbourhoods by demographics, income signals, housing mix, and transit access.
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, color: "#0f766e", fontWeight: 600 }}>mktiq.ca</div>
          <div style={{ fontSize: 15, color: "#475569" }}>Ontario · Real Estate Research</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
