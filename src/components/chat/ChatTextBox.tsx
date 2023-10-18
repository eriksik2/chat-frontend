"use client";

import { useEffect, useMemo, useState } from "react";

type ChatTextBoxProps = {
  onSend: (message: string) => void;
  canSend?: boolean;
};

export default function ChatTextBox(props: ChatTextBoxProps) {
  const canSend = props.canSend ?? true;

  const [value, setValue] = useState("");
  const [bigEditor, setBigEditor] = useState(false);

  function onKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      if (bigEditor) return;
      if (event.shiftKey) {
        setValue(value + "\n");
        return;
      }
      onSubmit();
    }
  }

  function onSubmit() {
    if (!canSend) return;
    if (value.trim().length !== 0) {
      props.onSend(value);
    }
    setValue("");
  }

  return (
    <div className="flex h-full w-1/2 flex-row items-center justify-center gap-4">
      <button
        className="rounded-full bg-blue-500 px-4 py-2 text-white drop-shadow-lg "
        onClick={(event) => {
          event.preventDefault();
          setBigEditor(!bigEditor);
          return false;
        }}
      >
        ^
      </button>
      <div onKeyDown={onKey}>
        <textarea
          wrap={bigEditor ? "soft" : "off"}
          rows={1}
          cols={40}
          className="no-scrollbar resize-none rounded-xl bg-white px-3 py-2 text-black drop-shadow-lg"
          style={{
            height: !bigEditor ? `calc(1rem + ${1}lh)` : "65vh",
            width: !bigEditor ? `calc(1.5rem + ${60}ch)` : "50vw",
            transition: "height 0.2s ease-in-out, width 0.2s ease-in-out",
          }}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (
              !bigEditor &&
              newValue.length > value.length &&
              newValue[newValue.length - 1] === "\n"
            )
              return;
            setValue(e.target.value);
          }}
        />
      </div>
      <button
        className="rounded-full bg-blue-500 px-4 py-2 text-white drop-shadow-lg "
        onClick={(event) => {
          event.preventDefault();
          onSubmit();
          return false;
        }}
      >
        Send
      </button>
    </div>
  );
}
