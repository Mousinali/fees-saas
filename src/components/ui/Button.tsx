import Link from "next/link";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
};

export default function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className,
  disabled,
}: ButtonProps) {
  const classes = clsx(
    "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200",
    {
      "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100":
        variant === "secondary",
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {children}
    </button>
  );
}