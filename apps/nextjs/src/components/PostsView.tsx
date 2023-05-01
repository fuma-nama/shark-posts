import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

import { type RouterOutputs } from "@acme/api";

import PostCard from "./PostCard";
import { useViewport } from "./layouts/main";
import { Spinner } from "./system/spinner";

type PostsViewProps = {
  allRows: RouterOutputs["post"]["get"];
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;

  fetchLatestPage?: () => void;
  isFetchingLatestPage?: boolean;
  unreadCount?: number;
};

export function PostsView({
  hasNextPage,
  allRows,
  fetchNextPage,
  isFetchingNextPage,
  fetchLatestPage,
  isFetchingLatestPage,
  unreadCount = 0,
}: PostsViewProps) {
  const { rootRef } = useViewport();

  const virtualizer = useVirtualizer({
    count: allRows.length + 1,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 100,
  });

  const items = virtualizer.getVirtualItems();
  const lastIndex = items[items.length - 1]?.index;

  useEffect(() => {
    if (lastIndex == null) {
      return;
    }

    if (lastIndex >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    lastIndex,
  ]);

  return (
    <div
      className="relative"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 flex w-full max-w-screen-lg flex-col"
        style={{
          transform: `translateY(${items[0]?.start ?? 0}px)`,
        }}
      >
        {items.map((virtualRow) => {
          const post = allRows[virtualRow.index];

          if (post == null) {
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="flex flex-col items-center"
              >
                {hasNextPage === undefined || hasNextPage ? (
                  <Spinner />
                ) : (
                  <p className="text-sm">Nothing more to load</p>
                )}
              </div>
            );
          }

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {unreadCount !== 0 && virtualRow.index === 0 && (
                <div
                  className={clsx(
                    "cursor-pointer rounded-md border-2 border-pink-400 bg-pink-500/10 p-2 text-center text-sm text-pink-300",
                    "mb-3 hover:bg-pink-500/20",
                  )}
                  onClick={() => void fetchLatestPage?.()}
                >
                  {isFetchingLatestPage
                    ? "Loading New Posts..."
                    : `Show ${unreadCount} Posts`}
                </div>
              )}
              <PostCard post={post} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
