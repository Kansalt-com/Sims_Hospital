import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = ({ variant = "primary", className, type = "button", ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[6px] px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        {
          "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700": variant === "primary",
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50": variant === "secondary",
          "bg-transparent text-slate-700 hover:bg-slate-100": variant === "ghost",
          "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700": variant === "danger",
        },
        className,
      )}
      {...props}
    />
  );
};
