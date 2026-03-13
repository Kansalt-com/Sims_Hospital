import { HospitalBrand } from "../branding/HospitalBrand";

type PrintHeaderProps = {
  hospitalName?: string;
  address?: string | null;
  phone?: string | null;
  metaLabel?: string;
  metaValue?: string;
  metaText?: string;
};

export const PrintHeader = ({
  hospitalName,
  address,
  phone,
  metaLabel,
  metaValue,
  metaText,
}: PrintHeaderProps) => {
  return (
    <header className="print-brand-header">
      <div className="print-brand-header__owner">
        <HospitalBrand
          className="print-brand-header__hospital-brand"
          titleClassName="print-brand-header__title"
          subtitleClassName="print-brand-header__subtitle"
          logoClassName="print-brand-header__logo"
        />
        <div className="print-brand-header__meta-copy">
          {hospitalName && hospitalName !== "SIMS Hospital" ? <p>{hospitalName}</p> : null}
          {address ? <p>{address}</p> : null}
          {phone ? <p>Phone: {phone}</p> : null}
        </div>
      </div>

      <div className="print-brand-header__provider">
        {(metaLabel || metaValue || metaText) ? (
          <div className="invoice-sheet__meta">
            {metaLabel ? <p className="invoice-sheet__meta-label">{metaLabel}</p> : null}
            {metaValue ? <p className="invoice-sheet__meta-value">{metaValue}</p> : null}
            {metaText ? <p>{metaText}</p> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};
