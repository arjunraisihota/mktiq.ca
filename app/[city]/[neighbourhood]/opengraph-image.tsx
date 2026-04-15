import { ImageResponse } from "next/og";
import { getNeighbourhoodBySlug } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ city: string; neighbourhood: string }>;
}

export async function generateImageMetadata({ params }: Props) {
  const { city, neighbourhood } = await params;
  const data = getNeighbourhoodBySlug(city, neighbourhood);
  const name = data?.neighbourhood.name ?? neighbourhood;
  const cityName = data?.city.cityName ?? city;
  return [{ alt: `${name}, ${cityName} Neighbourhood Guide | mktIQ`, id: "og" }];
}

export default async function Image({ params }: Props) {
  const { city, neighbourhood } = await params;
  const data = getNeighbourhoodBySlug(city, neighbourhood);
  const neighbourhoodName = data?.neighbourhood.name ?? neighbourhood;
  const cityName = data?.city.cityName ?? city;

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
          <div style={{ fontSize: 16, color: "#475569", marginBottom: 20, textTransform: "uppercase", letterSpacing: "3px" }}>
            {`${cityName} · Ontario`}
          </div>
          <div
            style={{
              fontSize: neighbourhoodName.length > 18 ? 58 : neighbourhoodName.length > 12 ? 70 : 82,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.0,
              letterSpacing: "-1.5px",
            }}
          >
            {neighbourhoodName}
          </div>
          <div style={{ marginTop: 28, fontSize: 22, color: "#94a3b8", lineHeight: 1.5 }}>
            Household breakdown · Income profile · Housing mix · Transit access
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, color: "#0f766e", fontWeight: 600 }}>mktiq.ca</div>
          <div style={{ fontSize: 15, color: "#475569" }}>Real Estate Intelligence</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
