/**
 * FATE KEY product catalogue. Prices are launch proposals, not active offers.
 * Never collect payment or imply checkout exists until the payment backend is live.
 */
const products = [
  { title: 'Free Birth Chart', price: 'Free', description: 'A first look at your birth chart, elemental balance and personality themes.', ready: true },
  { title: 'Complete Life Reading', price: '$14.99', description: 'A deeper look at personality, relationships, career, money and life chapters.', ready: false },
  { title: 'Love Compatibility', price: '$9.99', description: 'Explore how two birth charts relate, including communication and differences.', ready: false },
  { title: '2027 Year Ahead', price: '$7.99', description: 'A personal look at the themes of the coming year and its twelve months.', ready: false },
  { title: 'Career & Money', price: '$8.99', description: 'Focus on work preferences, financial habits and professional strengths.', ready: false },
  { title: 'Complete Bundle', price: '$24.99', description: 'Complete Life Reading, Love Compatibility and 2027 Year Ahead together.', ready: false },
] as const

export default function ProductCatalog() {
  return (
    <section id="reports" aria-labelledby="reports-heading" className="py-12 sm:py-16">
      <p className="text-center text-xs uppercase tracking-[.2em] text-[#e9c48c]">Explore your reading</p>
      <h2 id="reports-heading" className="mt-3 text-center font-serif text-3xl text-[#f7e8d0] sm:text-4xl">Choose Your Report</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-slate-300">Start with your free birth chart. Additional personalized reports are being prepared and are not yet available to purchase.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <article key={product.title} className="flex flex-col rounded-2xl border border-[#967244]/55 bg-[#0b2037] p-6">
            <h3 className="font-serif text-xl text-[#f3d49d]">{product.title}</h3>
            <p className="mt-2 text-2xl font-semibold text-[#fff4df]">{product.price}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-200">{product.description}</p>
            {product.ready ? (
              <a href="#birth-details" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e9bd7f] px-4 font-semibold text-[#08192b]">Start Free Reading</a>
            ) : (
              <span className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a7814b]/50 px-4 text-sm text-[#e9bd7f]">Coming soon · Proposed price</span>
            )}
          </article>
        ))}
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">Saju is a traditional interpretation for reflection, not a scientific prediction or financial advice. Listed paid prices are proposed and no checkout is active.</p>
    </section>
  )
}
