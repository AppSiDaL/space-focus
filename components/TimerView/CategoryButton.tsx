import React, { ReactNode } from "react";

interface CategoryButtonProps {
  name: string;
  icon: ReactNode;
  color: string;
  active: boolean;
  onClick: () => void;
}

export default function CategoryButton({
  name,
  icon,
  color,
  active,
  onClick,
}: CategoryButtonProps) {
  return (
    <button
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
        active
          ? `${color} bg-opacity-100 text-white`
          : `bg-[#1e293b] bg-opacity-30 hover:bg-opacity-50 text-white`
      }`}
      onClick={onClick}
      type="button"
      aria-label={`Select ${name} category`}
      title={name}
    >
      <div className="text-center mb-1">{icon}</div>
      <div className="text-xs font-medium">{name}</div>
    </button>
  );
}
