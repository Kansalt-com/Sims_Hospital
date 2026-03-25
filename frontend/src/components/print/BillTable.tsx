import clsx from "clsx";
import { Fragment } from "react";

export type BillSectionItem = {
  chargeDate: string;
  head: string;
  description: string;
  rate: string;
  qty: string;
  amount: string;
};

export type BillSection = {
  key: string;
  title: string;
  items: BillSectionItem[];
};

type BillTableProps = {
  sections: BillSection[];
};

const columns = [
  { key: "chargeDate", label: "Charges", className: "w-[14%]" },
  { key: "head", label: "Head", className: "w-[19%]" },
  { key: "description", label: "Description", className: "w-[31%]" },
  { key: "rate", label: "Rate", className: "w-[12%] text-right" },
  { key: "qty", label: "Qty", className: "w-[10%] text-right" },
  { key: "amount", label: "Amount", className: "w-[14%] text-right" },
] as const;

export const BillTable = ({ sections }: BillTableProps) => {
  return (
    <div className="overflow-hidden border-x border-b border-black">
      <table className="w-full table-fixed border-collapse text-[11px] text-slate-900">
        <thead>
          <tr className="bg-[#d6d6d6] font-bold">
            {columns.map((column) => (
              <th key={column.key} className={clsx("border border-black px-2 py-1 text-left", column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <Fragment key={section.key}>
              <tr key={`${section.key}-header`} className="bg-[#d9d9d9] font-bold">
                <td colSpan={6} className="border border-black px-2 py-1">
                  {section.title}
                </td>
              </tr>
              {section.items.length ? (
                section.items.map((item, index) => (
                  <tr key={`${section.key}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f5f5f5]"}>
                    <td className="border border-black px-2 py-1 align-top">{item.chargeDate}</td>
                    <td className="border border-black px-2 py-1 align-top">{item.head}</td>
                    <td className="border border-black px-2 py-1 align-top">{item.description}</td>
                    <td className="border border-black px-2 py-1 text-right align-top">{item.rate}</td>
                    <td className="border border-black px-2 py-1 text-right align-top">{item.qty}</td>
                    <td className="border border-black px-2 py-1 text-right font-semibold align-top">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr key={`${section.key}-empty`}>
                  <td className="border border-black px-2 py-1 text-slate-500" colSpan={6}>
                    -
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
