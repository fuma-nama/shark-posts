import { useState } from "react";
import { Editor, EditorState } from "draft-js";

import { trpc } from "~/utils/trpc";
import { button } from "../system/button";
import { Dialog } from "../system/dialog";

export default function CreatePostDialog(props: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const utils = trpc.useContext();
  const postMutation = trpc.post.create.useMutation({
    onSuccess: (post) => {
      props.setOpen(false);

      utils.post.all.setData(undefined, (prev) => {
        if (prev == null) return prev;

        return [post, ...prev];
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
    <Dialog {...props} size="md">
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
        <button
          className={button({ color: "secondary" })}
          onClick={() => props.setOpen(false)}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}
