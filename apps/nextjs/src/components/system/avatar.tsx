import Image from "next/image";

export function Avatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-pink-400">
      {src != null && (
        <Image
          src={src}
          alt={name}
          className="h-full w-full"
          width="40"
          height="40"
        />
      )}
      <span className="flex h-full w-full items-center justify-center">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
