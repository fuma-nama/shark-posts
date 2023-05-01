export function Spinner() {
  return (
    <div
      className="h-10 w-10 animate-spin items-center rounded-full border-4 border-slate-800 border-l-pink-400"
      role="progressbar"
      aria-busy="true"
    />
  );
}
