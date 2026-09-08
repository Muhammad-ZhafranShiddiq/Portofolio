import { ImageResponse } from "next/og";

export const alt =
  "Muhammad Zhafran Shiddiq — Project manager, data analyst, and developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1319",
          color: "#f4f6f2",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#8de8c6",
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 48, height: 4, background: "#8de8c6" }} />
          Portfolio · Bandung, Indonesia
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.04em" }}
          >
            Muhammad Zhafran Shiddiq
          </div>
          <div
            style={{
              maxWidth: 900,
              color: "#b9c2ca",
              fontSize: 36,
              lineHeight: 1.3,
            }}
          >
            Turning complex ideas and data into dependable digital products.
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: 26 }}>
          <span style={{ color: "#7891ff" }}>Project management</span>
          <span style={{ color: "#52606c" }}>•</span>
          <span style={{ color: "#7891ff" }}>Data</span>
          <span style={{ color: "#52606c" }}>•</span>
          <span style={{ color: "#7891ff" }}>Engineering</span>
        </div>
      </div>
    ),
    size,
  );
}

