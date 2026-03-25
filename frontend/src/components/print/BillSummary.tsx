type BillSummaryProps = {
  total: string;
  discount: string;
  net: string;
};

export const BillSummary = ({ total, discount, net }: BillSummaryProps) => {
  return (
    <div className="ml-auto w-full max-w-[340px] border border-black text-[12px] text-slate-900">
      <div className="flex items-center justify-between border-b border-black px-3 py-1.5">
        <span className="font-medium">Total Bill Amount</span>
        <span className="font-semibold">{total}</span>
      </div>
      <div className="flex items-center justify-between border-b border-black px-3 py-1.5 text-red-600">
        <span className="font-bold">Less Discount</span>
        <span className="font-bold">{discount}</span>
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 text-[13px]">
        <span className="font-bold">Net Amount</span>
        <span className="font-extrabold">{net}</span>
      </div>
    </div>
  );
};
