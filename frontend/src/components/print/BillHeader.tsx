import { HospitalBrand } from "../branding/HospitalBrand";

type BillHeaderProps = {
  hospitalName: string;
  addressLine: string;
  email: string;
  contact: string;
};

export const BillHeader = ({ hospitalName, addressLine, email, contact }: BillHeaderProps) => {
  return (
    <header className="relative overflow-hidden border border-black bg-gradient-to-r from-sky-100 via-cyan-50 to-blue-100 px-5 py-4">
      <div className="absolute inset-0">
        <span className="absolute left-8 top-4 text-4xl font-black text-sky-300/20">+</span>
        <span className="absolute left-32 top-14 text-2xl font-black text-cyan-300/20">+</span>
        <span className="absolute right-40 top-5 text-4xl font-black text-sky-300/20">+</span>
        <span className="absolute right-20 top-14 text-2xl font-black text-cyan-300/20">+</span>
        <span className="absolute bottom-4 left-1/4 text-3xl font-black text-sky-300/20">+</span>
        <span className="absolute bottom-3 right-1/3 text-3xl font-black text-cyan-300/20">+</span>
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-sky-200 bg-white/90 px-3 py-2 shadow-sm">
            <HospitalBrand
              compact
              className="items-center gap-3"
              logoClassName="h-16 w-16 rounded-none"
              titleClassName="text-[0px]"
              subtitleClassName="hidden"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-[16px] font-extrabold uppercase tracking-[0.03em] text-[#143a7b] sm:text-[18px]">
              {hospitalName}
            </h1>
            <p className="text-[11px] font-medium text-slate-700 sm:text-xs">{addressLine}</p>
            <p className="text-[11px] font-medium text-slate-700 sm:text-xs">E-mail: {email}</p>
            <p className="text-[11px] font-medium text-slate-700 sm:text-xs">Contact: {contact}</p>
          </div>
        </div>

        <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full border-[3px] border-[#1d2b7c] bg-white/95 text-center shadow-sm">
          <div className="leading-tight text-[#1d2b7c]">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em]">Certified</p>
            <p className="text-xl font-extrabold">ISO</p>
            <p className="text-[9px] font-semibold">9001:2015</p>
          </div>
        </div>
      </div>
    </header>
  );
};
