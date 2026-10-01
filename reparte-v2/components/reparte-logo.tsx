export function ReParteLogo({
  level = false,
  label = true,
}: {
  level?: boolean;
  label?: boolean;
}) {
  return (
    <div
      className="rp-brand"
      aria-label={label ? 'ReParte' : undefined}
      aria-hidden={label ? undefined : true}
    >
      <span className={`rp-logo-bars${level ? ' is-level' : ''}`}>
        <i />
        <i />
        <i />
        <i />
      </span>
      {label ? <span className="rp-wordmark">ReParte</span> : null}
    </div>
  );
}
