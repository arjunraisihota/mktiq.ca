import { ImageResponse } from "next/og";
import { getCityByRouteSlug } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateImageMetadata({ params }: Props) {
  const { city } = await params;
  const cityData = getCityByRouteSlug(city);
  return [{ alt: cityData ? `${cityData.cityName} Neighbourhood Guide | mktIQ` : "mktIQ", id: "og" }];
}

export default async function Image({ params }: Props) {
  const { city } = await params;
  const cityData = getCityByRouteSlug(city);
  const cityName = cityData?.cityName ?? city;
  const neighbourhoodCount = cityData?.neighbourhoods?.length ?? 0;

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
            Ontario · Neighbourhood Guide
          </div>
          <div
            style={{
              fontSize: cityName.length > 14 ? 64 : 80,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.0,
              letterSpacing: "-2px",
            }}
          >
            {cityName}
          </div>
          {neighbourhoodCount > 0 && (
            <div style={{ marginTop: 28, fontSize: 22, color: "#94a3b8", lineHeight: 1.5 }}>
              {`${neighbourhoodCount} neighbourhood${neighbourhoodCount !== 1 ? "s" : ""} · Demographics, income & transit`}
            </div>
          )}
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
