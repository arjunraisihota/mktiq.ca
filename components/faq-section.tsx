interface FaqItem {
  question: string;
  answer: string;
}

export function FAQSection({ title = "Frequently Asked Questions", items }: { title?: string; items: FaqItem[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-xl border border-edge bg-white p-6 shadow-card">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <details key={item.question} className="group rounded-lg border border-edge p-4 open:bg-slate-50">
            <summary className="cursor-pointer list-none font-medium text-ink">{item.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-stone">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
