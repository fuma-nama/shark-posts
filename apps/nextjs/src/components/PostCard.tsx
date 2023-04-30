import type { ComponentProps } from "react";
import { CopyIcon, DotsHorizontalIcon, TrashIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useSession } from "next-auth/react";

import { type RouterOutputs } from "@acme/api";

import { Avatar } from "./system/avatar";
import { Dropdown } from "./system/dropdown";

type Props = {
  post: RouterOutputs["post"]["all"][number];
  onPostDelete?: () => void;
  rootProps?: ComponentProps<"div"> & {
    "data-index": number;
  };
};

export default function PostCard(props: Props) {
  const { post } = props;

  return (
    <div {...props.rootProps}>
      <div className="mb-4 flex flex-row rounded-lg bg-slate-900 p-4">
        <div className="mr-2">
          <Avatar src={post.author.image} name={post.author.name} />
        </div>
        <div className="flex-grow">
          <div className="flex flex-row items-center justify-between">
            <p className="font-semibold">{post.author.name}</p>
            <OptionsDropdown {...props} />
          </div>
          <p className="mt-1 whitespace-pre-line">{post.content}</p>
        </div>
      </div>
    </div>
  );
}

function OptionsDropdown({ post, onPostDelete }: Props) {
  const { data } = useSession();
  const isAuthor = data?.user.id === post.author_id;

  const onCopy = () => {
    void navigator.clipboard.writeText(post.content);
  };

  return (
    <Dropdown
      button={
        <Dropdown.Button className="group relative inline-flex justify-center rounded-full text-white">
          <div
            className={clsx(
              "absolute -left-2 -top-2 h-8 w-8 rounded-full transition-colors",
              "group-hover:bg-pink-500/10 ui-open:bg-pink-500/10",
            )}
          />
          <DotsHorizontalIcon className="transition-colors group-hover:text-pink-400 ui-open:text-pink-400" />
        </Dropdown.Button>
      }
    >
      <Dropdown.Item onClick={onCopy}>
        <CopyIcon className="mr-2 h-5 w-5" /> Copy Content
      </Dropdown.Item>
      <Dropdown.Item color="danger" onClick={onPostDelete} disabled={!isAuthor}>
        <TrashIcon className="mr-2 h-5 w-5" /> Delete
      </Dropdown.Item>
    </Dropdown>
  );
}
