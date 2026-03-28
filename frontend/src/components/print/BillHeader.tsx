import { buildPublicAssetPath } from "../../utils/branding";

type BillHeaderProps = {
  hospitalName: string;
  addressLine: string;
  email: string;
  contact: string;
};

export const BillHeader = ({ hospitalName, addressLine, email, contact }: BillHeaderProps) => {
  const bannerSrc = buildPublicAssetPath("assets/branding/prescription-banner.png");

  return (
    <header className="border-b border-black">
      <img
        src={bannerSrc}
        alt={`${hospitalName} banner`}
        className="block w-full"
      />
    </header>
  );
};
