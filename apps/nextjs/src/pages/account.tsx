import { useMutation } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";

import { useMainLayout } from "~/components/layouts/main";
import { Avatar } from "~/components/system/avatar";
import { button } from "~/components/system/button";
import { type NextPageWithLayout } from "./_app";

const AccountPage: NextPageWithLayout = () => {
  const { data, status } = useSession();
  const logoutMutation = useMutation(() => signOut());

  return (
    <div className="flex flex-col gap-4">
      {status === "authenticated" && (
        <Avatar src={data.user.image ?? null} name={data.user.name} />
      )}
      <h2 className="text-xl font-bold">{data?.user.name}</h2>
      <div className="flex flex-row gap-3">
        <button
          disabled={logoutMutation.isLoading}
          className={button({ color: "danger" })}
          onClick={() => logoutMutation.mutate()}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

AccountPage.useLayout = useMainLayout;

export default AccountPage;
