import {
  CopyIcon,
  DotsHorizontalIcon,
  HeartFilledIcon,
  HeartIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";
import { useSession } from "next-auth/react";

import { type RouterOutputs } from "@acme/api";

import { updateInfiniteData } from "~/utils/cache";
import { trpc } from "~/utils/trpc";
import { Avatar } from "./system/avatar";
import { Dropdown } from "./system/dropdown";

type Props = {
  post: RouterOutputs["post"]["get"][number];
};

export default function PostCard(props: Props) {
  const { post } = props;

  return (
    <div className="mb-4 flex flex-row rounded-lg bg-slate-900 p-2 lg:p-4">
      <div className="mr-2">
        <Avatar src={post.author.image} name={post.author.name} />
      </div>
      <div className="flex-grow">
        <div className="flex flex-row items-center justify-between">
          <p className="font-semibold">{post.author.name}</p>
          <OptionsDropdown {...props} />
        </div>
        <p className="mt-1 whitespace-pre-line text-[16px]">{post.content}</p>
        <Actions post={post} />
      </div>
    </div>
  );
}

function Actions({ post }: { post: Props["post"] }) {
  const utils = trpc.useContext();
  const mutation = trpc.post.setToFavourite.useMutation();

  const onFavourite = () => {
    if (mutation.isLoading) return;

    const isFavourite = !post.isFavourite;
    void mutation.mutateAsync({ post_id: post.id, favourite: isFavourite });

    utils.post.get.setInfiniteData({ limit: 10 }, (prev) => {
      if (prev == null) return prev;

      const pages = updateInfiniteData(prev.pages, post.timestamp, (page) =>
        page.map((row) =>
          row.id === post.id
            ? {
                ...row,
                isFavourite,
                favourites: isFavourite
                  ? row.favourites + 1
                  : row.favourites - 1,
              }
            : row,
        ),
      );

      return {
        ...prev,
        pages,
      };
    });
  };

  return (
    <div className="mt-3 flex h-[20px] flex-row gap-3">
      <div
        className={clsx(
          "flex cursor-pointer flex-row items-center gap-2 text-sm",
          {
            "text-pink-400": post.isFavourite,
            "text-slate-400": !post.isFavourite,
          },
        )}
        onClick={onFavourite}
      >
        {post.isFavourite ? (
          <HeartFilledIcon className="h-4 w-4" />
        ) : (
          <HeartIcon className="h-4 w-4" />
        )}
        {post.favourites !== 0 && <span>{post.favourites}</span>}
      </div>
    </div>
  );
}

function OptionsDropdown({ post }: Props) {
  const { data } = useSession();
  const isAuthor = data?.user.id === post.author_id;
  const utils = trpc.useContext();
  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess(_, deletedId) {
      utils.post.get.setInfiniteData({ limit: 10 }, (prev) => {
        if (prev == null) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page) =>
            page.filter((post) => post.id !== deletedId),
          ),
        };
      });
    },
  });

  const onCopy = () => {
    void navigator.clipboard.writeText(post.content);
  };

  const onDelete = () => {
    deleteMutation.mutate(post.id);
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
      <Dropdown.Item color="danger" onClick={onDelete} disabled={!isAuthor}>
        <TrashIcon className="mr-2 h-5 w-5" /> Delete
      </Dropdown.Item>
    </Dropdown>
  );
}
