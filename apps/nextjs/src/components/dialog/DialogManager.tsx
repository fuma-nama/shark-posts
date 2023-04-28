import dynamic from "next/dynamic";

import { useModalStore } from "~/stores/modal";

const CreatePostDialog = dynamic(() => import("./CreatePostDialog"));

export function DialogManager() {
  const [opening, setOpening] = useModalStore((s) => [s.opening, s.setOpening]);

  return (
    <>
      {opening["create-post"] !== undefined && (
        <CreatePostDialog
          open={opening["create-post"] === true}
          setOpen={(v) => setOpening("create-post", v)}
        />
      )}
    </>
  );
}
