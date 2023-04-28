import { CopyIcon, TrashIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";

import { type RouterOutputs } from "@acme/api";

import { Avatar } from "./system/avatar";
import { Dropdown } from "./system/dropdown";

type Props = {
  post: RouterOutputs["post"]["all"][number];
  onPostDelete?: () => void;
};

export default function PostCard({ post, onPostDelete }: Props) {
  const { data } = useSession();
  const isAuthor = data?.user.id === post.author_id;

  return (
    <div className="flex cursor-pointer flex-row rounded-lg bg-slate-900 p-4">
      <div className="mr-2">
        <Avatar src={post.author.image} name={post.author.name} />
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{post.author.name}</p>
        <p className="mt-1 whitespace-pre-line">{post.content}</p>
      </div>
      {isAuthor && (
        <div>
          <Dropdown>
            <Dropdown.Item>
              <CopyIcon className="mr-2 h-5 w-5" /> Copy Content
            </Dropdown.Item>
            <Dropdown.Item color="danger" onClick={onPostDelete}>
              <TrashIcon className="mr-2 h-5 w-5" /> Delete
            </Dropdown.Item>
          </Dropdown>
        </div>
      )}
    </div>
  );
}
