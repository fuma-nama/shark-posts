import type { Config } from "tailwindcss";

export default {
  content: [""],
  theme: {
    extend: {},
  },
  plugins: [require("@headlessui/tailwindcss")],
} satisfies Config;
