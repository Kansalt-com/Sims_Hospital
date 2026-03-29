import clsx from "clsx";
import { useDelayedVisibility } from "../../hooks/useDelayedVisibility";

type GlobalLoaderProps = {
  active?: boolean;
  variant?: "fullPage" | "section" | "inline";
  text?: string;
  className?: string;
  delayMs?: number;
  minVisibleMs?: number;
};

export const GlobalLoader = ({
  active = true,
  variant = "section",
  text,
  className,
  delayMs,
  minVisibleMs,
}: GlobalLoaderProps) => {
  const visible = useDelayedVisibility(active, { delayMs, minVisibleMs });

  if (!visible) {
    return null;
  }

  if (variant === "inline") {
    return (
      <span
        aria-label="Loading"
        aria-live="polite"
        className={clsx("inline-flex items-center justify-center", className)}
        role="status"
      >
        <span className="loader-inline" />
      </span>
    );
  }

  return (
    <div
      aria-label="Loading"
      aria-live="polite"
      className={clsx(
        variant === "fullPage" ? "global-loader global-loader--full-page" : "global-loader global-loader--section",
        className,
      )}
      role="status"
    >
      <div className="global-loader__surface">
        <div className="global-loader__orb-wrap" aria-hidden="true">
          <span className="global-loader__halo" />
          <span className="global-loader__ring global-loader__ring--outer" />
          <span className="global-loader__ring global-loader__ring--inner" />
          <span className="global-loader__orb" />
        </div>
        {text ? <p className="global-loader__text">{text}</p> : null}
      </div>
    </div>
  );
};
