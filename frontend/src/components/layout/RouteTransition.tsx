import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";

export const RouteTransition = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const locationKey = `${location.pathname}${location.search}`;
  const [displayOutlet, setDisplayOutlet] = useState(outlet);
  const [displayKey, setDisplayKey] = useState(locationKey);
  const [stage, setStage] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (locationKey === displayKey) {
      setDisplayOutlet(outlet);
      return;
    }

    setStage("exit");
    const timeoutId = window.setTimeout(() => {
      setDisplayOutlet(outlet);
      setDisplayKey(locationKey);
      setStage("enter");
    }, 140);

    return () => window.clearTimeout(timeoutId);
  }, [displayKey, locationKey, outlet]);

  return (
    <div className="route-transition-shell">
      {stage === "exit" ? (
        <div className="route-transition-bar" aria-hidden="true">
          <span className="route-transition-bar__pulse" />
        </div>
      ) : null}
      <div className={stage === "enter" ? "route-transition route-transition--enter" : "route-transition route-transition--exit"}>
        {displayOutlet}
      </div>
    </div>
  );
};
