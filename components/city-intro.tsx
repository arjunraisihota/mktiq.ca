export function CityIntro({ cityName, intro }: { cityName: string; intro: string }) {
  return (
    <section className="mb-10">
      <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {cityName} Neighbourhood Guide
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone">{intro}</p>
    </section>
  );
}
