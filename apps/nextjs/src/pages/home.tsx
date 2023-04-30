import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { trpc } from "~/utils/trpc";
import PostCard from "~/components/PostCard";
import { useMainLayout, useViewport } from "~/components/layouts/main";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const { rootRef } = useViewport();
  const utils = trpc.useContext();
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = trpc.post.get.useInfiniteQuery(
    { limit: 10 },
    {
      getPreviousPageParam: (firstPage) =>
        firstPage.length !== 0
          ? {
              date: toNonNull(firstPage[0]).timestamp,
              type: "after",
            }
          : undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length !== 0
          ? {
              date: toNonNull(lastPage[lastPage.length - 1]).timestamp,
              type: "before",
            }
          : undefined,
    },
  );

  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess(_, variables) {
      utils.post.all.setData(undefined, (prev) =>
        prev?.filter((post) => post.id !== variables),
      );
    },
  });

  const allRows = data ? data.pages.flatMap((d) => d) : [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => toNonNull(rootRef.current),
    estimateSize: () => 100,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = items[items.length - 1];

    if (lastItem == null) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, items]);

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div
      className="relative flex w-full flex-col"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 mr-3 max-w-screen-lg"
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
              >
                {hasNextPage ? (
                  <p>Loading more...</p>
                ) : (
                  <p>Nothing more to load</p>
                )}
              </div>
            );
          }

          return (
            <PostCard
              key={virtualRow.key}
              post={post}
              onPostDelete={() => deletePostMutation.mutate(post.id)}
              rootProps={{
                "data-index": virtualRow.index,
                ref: virtualizer.measureElement,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

function toNonNull<T>(v: T | null | undefined): T {
  return v as unknown as T;
}

Home.useLayout = useMainLayout;

export default Home;
