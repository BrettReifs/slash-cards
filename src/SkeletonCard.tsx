export function SkeletonCard() {
  return (
    <article className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__shine" />
      <div className="skeleton-card__header">
        <span className="skeleton skeleton--command" />
        <span className="skeleton skeleton--pill" />
      </div>
      <div className="skeleton-card__body">
        <span className="skeleton skeleton--line" />
        <span className="skeleton skeleton--line skeleton--line-short" />
      </div>
      <div className="skeleton-card__footer">
        <span className="skeleton skeleton--pill skeleton--pill-small" />
        <span className="skeleton skeleton--pill skeleton--pill-small" />
      </div>
    </article>
  );
}
