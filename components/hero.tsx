import Link from "next/link";

interface HeroProps {
  cityCount: number;
  neighbourhoodCount: number;
  featuredCityRoute: string;
  featuredCityName: string;
}

export function Hero({ cityCount, neighbourhoodCount, featuredCityRoute, featuredCityName }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-edge bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand">Ontario Real Estate Intelligence</p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl md:text-6xl">
          Pick a city, compare neighbourhoods, decide with confidence.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone sm:text-lg">
          mktIQ gives you one clean flow from city overview to street-level context with comparable signals for households, housing, income, and transit.
        </p>

        <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 rounded-xl border border-edge bg-white/80 p-3 text-sm sm:flex sm:flex-wrap sm:gap-6 sm:border-0 sm:bg-transparent sm:p-0">
          <p className="text-stone">
            <span className="block text-lg font-semibold text-ink sm:inline sm:text-base">{cityCount}</span> city guides
          </p>
          <p className="text-stone">
            <span className="block text-lg font-semibold text-ink sm:inline sm:text-base">{neighbourhoodCount}</span> neighbourhood pages
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href="#cities"
            className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start with city selection
          </Link>
          <Link
            href={`/${featuredCityRoute}`}
            className="inline-flex items-center justify-center rounded-md border border-edge bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            Open {featuredCityName} guide
          </Link>
        </div>
      </div>
    </section>
  );
}
