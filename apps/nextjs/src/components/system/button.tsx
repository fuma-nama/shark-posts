import { tv } from "tailwind-variants";

export const button = tv({
  base: "font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    color: {
      primary: [
        "bg-pink-400 text-white transition-colors duration-200",
        "hover:bg-pink-500",
      ],
      secondary: "bg-slate-800 text-white",
      danger:
        "bg-red-500 text-white transition-colors duration-200 hover:bg-red-600",
    },
    content: {
      "inline-flex": "justify-center items-center inline-flex flex-row gap-2",
    },
    size: {
      lg: "text-lg px-4 py-2",
      md: "text-base px-4 py-1.5",
    },
  },
  defaultVariants: {
    color: "secondary",
    size: "md",
  },
});
