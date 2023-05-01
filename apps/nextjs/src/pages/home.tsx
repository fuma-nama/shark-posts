import { trpc } from "~/utils/trpc";
import { PostsView } from "~/components/PostsView";
import { useMainLayout } from "~/components/layouts/main";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
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

  if (status === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <PostsView
      allRows={allRows}
      fetchLatestPage={() => void fetchPreviousPage()}
      fetchNextPage={() => void fetchNextPage()}
      hasNextPage={hasNextPage}
      isFetchingLatestPage={isFetchingPreviousPage}
      isFetchingNextPage={isFetchingNextPage}
      unreadCount={newPostsQuery.data?.count ?? 0}
    />
  );
};

Home.useLayout = useMainLayout;

export default Home;
