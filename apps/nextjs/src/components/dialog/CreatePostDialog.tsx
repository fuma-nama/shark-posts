import { useState } from "react";
import { Editor, EditorState } from "draft-js";

import { trpc } from "~/utils/trpc";
import { button } from "../system/button";
import { Dialog } from "../system/dialog";

export default function CreatePostDialog(props: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <Dialog {...props} size="md">
      <Content onClose={() => props.setOpen(false)} />
    </Dialog>
  );
}

function Content({ onClose }: { onClose: () => void }) {
  const utils = trpc.useContext();
  const postMutation = trpc.post.create.useMutation({
    onSuccess: (post) => {
      onClose();

      utils.post.get.setInfiniteData({ limit: 10 }, (prev) => {
        if (prev == null) return prev;

        return {
          pageParams: prev.pageParams,
          pages: [[post], ...prev.pages],
        };
      });
    },
  });
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

  const onPost = () => {
    postMutation.mutate({
      content: editorState.getCurrentContent().getPlainText("\n"),
    });
  };

  return (
    <>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        placeholder="Write something here..."
      />

      <div className="mt-4 flex flex-row gap-3">
        <button
          disabled={postMutation.isLoading}
          onClick={onPost}
          className={button({
            color: "primary",
            content: "inline-flex",
          })}
        >
          Post
        </button>
        <button className={button({ color: "secondary" })} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
