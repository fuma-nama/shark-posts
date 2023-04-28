import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

import { useMainLayout } from "~/components/layouts/main";
import { button } from "~/components/system/button";
import { type NextPageWithLayout } from "./_app";

const AccountPage: NextPageWithLayout = () => {
  const logoutMutation = useMutation(() => signOut());

  return (
    <div>
      <button
        disabled={logoutMutation.isLoading}
        className={button({ color: "danger" })}
        onClick={() => logoutMutation.mutate()}
      >
        Logout
      </button>
    </div>
  );
};

AccountPage.useLayout = useMainLayout;

export default AccountPage;
