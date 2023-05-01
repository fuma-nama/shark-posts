import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { trpc } from "~/utils/trpc";
import PostCard from "~/components/PostCard";
import { useMainLayout, useViewport } from "~/components/layouts/main";
import { Spinner } from "~/components/system/spinner";
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
    { limit: 4 },
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

  const allRows = data ? data.pages.flatMap((d) => d) : [];

  const virtualizer = useVirtualizer({
    count: allRows.length + 1,
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
