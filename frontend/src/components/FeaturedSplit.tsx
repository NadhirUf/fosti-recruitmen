interface FeaturedSplitItem {
  src: string;
  caption: string;
  href?: string;
  objectPosition?: string;
}

interface FeaturedSplitProps {
  title?: string;
  items: [FeaturedSplitItem, FeaturedSplitItem];
}

export default function FeaturedSplit({ title, items }: FeaturedSplitProps) {
  return (
    <section className="relative py-16 sm:py-20">
      {title && (
        <div className="mx-auto max-w-content px-6">
          <h2 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
        </div>
      )}

      {/* Full-bleed: lepas dari max-w-content, nempel ujung layar */}
      <div className="mt-8 flex w-screen flex-col gap-1 px-1 sm:flex-row sm:gap-2 sm:px-2">
        {items.map((item, i) => (
          <SplitPanel key={i} {...item} />
        ))}
      </div>
    </section>
  );
}

function SplitPanel({ src, caption, href, objectPosition }: FeaturedSplitItem) {
  const content = (
    <div className="group relative h-[60vh] w-full overflow-hidden rounded-2xl sm:h-[85vh] sm:w-1/2">
      <img
        src={src}
        alt={caption}
        style={{ objectPosition: objectPosition ?? "center" }}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      {/* Overlay gradient tipis di bawah biar caption kebaca jelas di atas foto apapun */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      {/* Border tipis di semua sisi biar panel keliatan "berbingkai" */}
      <div className="pointer-events-none absolute inset-0 border border-white/10" />
      <span className="absolute bottom-5 left-5 text-sm font-medium text-white sm:text-base">
        {caption}
      </span>
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}
