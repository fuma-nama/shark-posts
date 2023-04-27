import { type RouterOutputs } from "@acme/api";

type Props = {
  post: RouterOutputs["post"]["all"][number];
  onPostDelete?: () => void;
};

export default function PostCard({ post, onPostDelete }: Props) {
  return (
    <div className="flex cursor-pointer flex-row rounded-lg border-2 border-slate-800 bg-slate-900 p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <p className="mt-2 text-sm">{post.content}</p>
      </div>
      <div>
        <button
          className="rounded-md border-2 border-red-400 bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400"
          onClick={onPostDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
