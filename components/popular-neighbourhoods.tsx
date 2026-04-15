import Link from "next/link";

interface Item {
  cityName: string;
  cityRouteSlug: string;
  neighbourhoodSlug: string;
  neighbourhoodName: string;
}

export function PopularNeighbourhoods({ items }: { items: Item[] }) {
  if (!items.length) return null;

  return (
    <section className="mx-auto mt-12 max-w-6xl px-6" id="popular-neighbourhoods">
      <div className="rounded-2xl border border-edge bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-ink">Popular neighbourhood pages</h2>
        <p className="mt-2 text-sm text-stone">
          Jump into high-interest neighbourhood profiles across Ontario.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={`${item.cityRouteSlug}-${item.neighbourhoodSlug}`}
              href={`/${item.cityRouteSlug}/${item.neighbourhoodSlug}`}
              className="rounded-lg border border-edge bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <p className="font-medium text-ink">{item.neighbourhoodName}</p>
              <p className="mt-1 text-sm text-stone">{item.cityName}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
