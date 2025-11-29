interface SarcomaRibbonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SarcomaRibbon = ({ size = "md", className = "" }: SarcomaRibbonProps) => {
  const sizes = {
    sm: "w-6 h-8",
    md: "w-10 h-14",
    lg: "w-14 h-20",
  };

  return (
    <svg
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizes[size]} ${className}`}
    >
      {/* Yellow ribbon for sarcoma awareness */}
      <path
        d="M20 0C14 0 10 4 10 10C10 16 14 24 20 32C26 24 30 16 30 10C30 4 26 0 20 0Z"
        className="fill-sarcoma"
      />
      <path
        d="M10 10C10 16 14 24 20 32L8 56L20 44L32 56L20 32C26 24 30 16 30 10"
        className="fill-sarcoma"
      />
      {/* Subtle shadow/depth */}
      <path
        d="M20 32L8 56L20 44"
        className="fill-sarcoma-dark opacity-30"
      />
      <path
        d="M20 0C17 0 14.5 1.5 13 4C15 3 17.5 2.5 20 2.5C22.5 2.5 25 3 27 4C25.5 1.5 23 0 20 0Z"
        className="fill-white opacity-40"
      />
    </svg>
  );
};
