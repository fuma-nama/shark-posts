import { trpc } from "~/utils/trpc";
import PostCard from "~/components/PostCard";
import { useMainLayout } from "~/components/layouts/main";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const postQuery = trpc.post.all.useQuery();

  const deletePostMutation = trpc.post.delete.useMutation({
    onSettled: () => postQuery.refetch(),
  });

  return (
    <div className="flex flex-col gap-4 overflow-y-auto py-5">
      {postQuery.data ? (
        postQuery.data?.length === 0 ? (
          <span>There are no posts!</span>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {postQuery.data?.map((p) => {
              return (
                <PostCard
                  key={p.id}
                  post={p}
                  onPostDelete={() => deletePostMutation.mutate(p.id)}
                />
              );
            })}
          </div>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

Home.useLayout = useMainLayout;

export default Home;
