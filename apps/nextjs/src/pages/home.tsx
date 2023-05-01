import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

import { trpc } from "~/utils/trpc";
import PostCard from "~/components/PostCard";
import { useMainLayout, useViewport } from "~/components/layouts/main";
import { Spinner } from "~/components/system/spinner";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const { rootRef } = useViewport();
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasNextPage,
  } = trpc.post.get.useInfiniteQuery(
    { limit: 10 },
    {
      staleTime: Infinity,
      getPreviousPageParam: (_, pages) => {
        const page = pages.find((page) => page.length !== 0);
        if (page == null) return undefined;

        return {
          date: page[0].timestamp,
          type: "after",
        };
      },
      getNextPageParam: (lastPage) =>
        lastPage.length !== 0
          ? {
              date: lastPage[lastPage.length - 1].timestamp,
              type: "before",
            }
          : undefined,
    },
  );

  const allRows = data ? data.pages.flatMap((d) => d) : [];

  const newPostsQuery = trpc.post.hasNewPosts.useQuery(
    { after: allRows[0]?.timestamp },
    {
      initialData: { count: 0 },
      enabled: allRows.length !== 0,
      staleTime: 10 * 1000,
      refetchInterval: 20 * 1000,
    },
  );

  const virtualizer = useVirtualizer({
    count: allRows.length + 1,
    getScrollElement: () => rootRef.current,
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
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              {newPostsQuery.isSuccess &&
                newPostsQuery.data.count !== 0 &&
                virtualRow.index === 0 && (
                  <div
                    className={clsx(
                      "cursor-pointer rounded-md border-2 border-pink-400 bg-pink-500/10 p-2 text-center text-sm text-pink-300",
                      "mb-3 hover:bg-pink-500/20",
                    )}
                    onClick={() => {
                      void fetchPreviousPage();
                    }}
                  >
                    {isFetchingPreviousPage
                      ? "Loading New Posts..."
                      : `Show ${newPostsQuery.data.count} Posts`}
                  </div>
                )}
              <PostCard post={post} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

Home.useLayout = useMainLayout;

export default Home;
