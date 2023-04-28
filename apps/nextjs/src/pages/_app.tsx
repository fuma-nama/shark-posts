import "../styles/globals.css";
import type { ReactNode } from "react";
import type { NextPage } from "next";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "~/utils/trpc";
import { DialogManager } from "~/components/dialog/DialogManager";

export type NextPageWithLayout<T = unknown> = NextPage<T> & {
  useLayout?: (children: ReactNode) => ReactNode;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const getLayout = (Component as NextPageWithLayout).useLayout ?? ((c) => c);

  return (
    <SessionProvider session={session}>
      <DialogManager />
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
