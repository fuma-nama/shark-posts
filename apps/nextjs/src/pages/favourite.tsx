import { trpc } from "~/utils/trpc";
import { PostsView } from "~/components/PostsView";
import { useMainLayout } from "~/components/layouts/main";
import type { NextPageWithLayout } from "./_app";

const FavouritePostPage: NextPageWithLayout = () => {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = trpc.post.getFavourites.useInfiniteQuery(
    { limit: 10 },
    {
      staleTime: 10 * 1000,
      getNextPageParam: (lastPage) =>
        lastPage.length !== 0
          ? lastPage[lastPage.length - 1].timestamp
          : undefined,
    },
  );

  const allRows = data ? data.pages.flatMap((d) => d) : [];

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
      fetchNextPage={() => void fetchNextPage()}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

FavouritePostPage.useLayout = useMainLayout;

export default FavouritePostPage;
