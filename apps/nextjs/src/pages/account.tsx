import { useMutation } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";

import { useMainLayout } from "~/components/layouts/main";
import { Avatar } from "~/components/system/avatar";
import { button } from "~/components/system/button";
import { Spinner } from "~/components/system/spinner";
import { type NextPageWithLayout } from "./_app";

const AccountPage: NextPageWithLayout = () => {
  const { data, status } = useSession();
  const logoutMutation = useMutation(() => signOut());

  if (status !== "authenticated") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex max-w-screen-lg flex-col gap-4 p-4">
      <div className="-mx-4 -mb-20 h-40 rounded-md bg-pink-400" />
      <Avatar
        src={data.user.image ?? null}
        name={data.user.name}
        size="lg"
        className="border-4 border-slate-950"
      />
      <h2 className="text-xl font-bold">{data.user.name}</h2>
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
