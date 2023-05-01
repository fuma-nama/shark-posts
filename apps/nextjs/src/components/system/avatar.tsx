import Image from "next/image";
import { tv, type VariantProps } from "tailwind-variants";

type AvatarProps = {
  src: string | null;
  name: string;
  className?: string;
} & VariantProps<typeof avatar>;

const avatar = tv({
  base: "flex-shrink-0 overflow-hidden rounded-full bg-pink-400",
  variants: {
    size: {
      sm: "h-[40px] w-[40px]",
      lg: "h-[100px] w-[100px]",
    },
  },
});

export function Avatar({ src, name, size = "sm", className }: AvatarProps) {
  const styles = avatar({ size, className });

  return (
    <div className={styles}>
      {src != null && (
        <Image
          src={src}
          alt={name}
          className="h-full w-full"
          width={size === "sm" ? "40" : "100"}
          height={size === "sm" ? "40" : "100"}
        />
      )}
      <span className="flex h-full w-full items-center justify-center">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
