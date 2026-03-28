import clsx from "clsx";
import { buildPublicAssetPath } from "../../utils/branding";

type PoweredByKansaltProps = {
  className?: string;
  labelClassName?: string;
  logoClassName?: string;
  stacked?: boolean;
};

export const PoweredByKansalt = ({
  className,
  labelClassName,
  logoClassName,
  stacked = false,
}: PoweredByKansaltProps) => {
  return (
    <div className={clsx("powered-by-kansalt", stacked && "powered-by-kansalt--stacked", className)}>
      <span className={clsx("powered-by-kansalt__label", labelClassName)}>Powered by</span>
      <div className="powered-by-kansalt__brand">
        <img
          src={buildPublicAssetPath("assets/branding/qode27-mark-cropped.png")}
          alt="Qode27 mark"
          className={clsx("powered-by-kansalt__mark", logoClassName)}
        />
        <img
          src={buildPublicAssetPath("assets/branding/qode27-wordmark-cropped.png")}
          alt="Qode27.com"
          className={clsx("powered-by-kansalt__logo", logoClassName)}
        />
      </div>
    </div>
  );
};
