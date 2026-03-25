import { BillHeader } from "./BillHeader";
import { BillSummary } from "./BillSummary";
import { BillTable, type BillSection } from "./BillTable";

type DetailField = {
  label: string;
  value: string;
};

type BillLayoutProps = {
  leftDetails: DetailField[];
  rightDetails: DetailField[];
  sections: BillSection[];
  total: string;
  discount: string;
  net: string;
};

const hospitalMeta = {
  hospitalName: "SIMS Hospital & Research Centre",
  addressLine: "Road No. 2, Beside Bari Masjid, Mango, Jamshedpur-832110",
  email: "simshospital2024@gmail.com",
  contact: "+91 7050324365 / +91 9507724365",
};

export const BillLayout = ({ leftDetails, rightDetails, sections, total, discount, net }: BillLayoutProps) => {
  return (
    <article className="sims-bill-sheet relative mx-auto w-full max-w-[980px] bg-white text-slate-900 shadow-[0_14px_48px_rgba(15,23,42,0.12)] print:max-w-none print:shadow-none">
      <div className="relative border border-black">
        <BillHeader {...hospitalMeta} />

        <div className="border-b border-black px-4 py-2 text-center">
          <h2 className="text-[18px] font-extrabold underline">Final Bill</h2>
        </div>

        <section className="grid grid-cols-1 border-b border-black md:grid-cols-2">
          <div className="border-b border-black md:border-b-0 md:border-r">
            {leftDetails.map((detail) => (
              <div key={detail.label} className="grid grid-cols-[138px_1fr] gap-2 border-b border-black px-3 py-1 text-[12px] last:border-b-0">
                <span className="font-medium">{detail.label}</span>
                <span>{detail.value}</span>
              </div>
            ))}
          </div>
          <div>
            {rightDetails.map((detail) => (
              <div key={detail.label} className="grid grid-cols-[138px_1fr] gap-2 border-b border-black px-3 py-1 text-[12px] last:border-b-0">
                <span className="font-medium">{detail.label}</span>
                <span>{detail.value}</span>
              </div>
            ))}
          </div>
        </section>

        <BillTable sections={sections} />

        <div className="border-x border-b border-black px-3 py-2">
          <BillSummary total={total} discount={discount} net={net} />
        </div>

        <footer className="grid grid-cols-[1fr_240px] border-x border-b border-black">
          <div className="min-h-[72px] border-r border-black px-3 py-2 text-[12px]">0</div>
          <div className="flex min-h-[72px] flex-col items-center justify-end px-3 py-2 text-[12px]">
            <div className="mb-1 w-full max-w-[120px] border-b border-[#4c74c9]" />
            <p className="text-[11px] font-medium text-[#4c74c9]">Signature</p>
            <p className="font-semibold">Authorised Signatory</p>
          </div>
        </footer>
      </div>
    </article>
  );
};
