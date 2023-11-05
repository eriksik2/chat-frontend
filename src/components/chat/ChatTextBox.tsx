"use client";

import clsx from "clsx";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaChevronUp } from "react-icons/fa6";

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
    <div className="flex h-full w-full max-w-screen-sm flex-row items-center justify-center gap-4 px-4 drop-shadow-sm">
      <button
        className="rounded-full bg-blue-500 px-2 py-2 text-white drop-shadow-lg"
        onClick={(event) => {
          event.preventDefault();
          setBigEditor(!bigEditor);
          return false;
        }}
      >
        <FaChevronUp
          className={clsx(
            "transition-transform duration-200",
            bigEditor && "rotate-180 transform",
          )}
        />
      </button>
      <div onKeyDown={onKey} className="flex flex-grow items-center">
        <textarea
          wrap={bigEditor ? "soft" : "off"}
          rows={1}
          cols={40}
          className="no-scrollbar resize-none rounded-xl bg-gray-100 px-3 py-2 text-black shadow-inner"
          style={{
            height: !bigEditor ? `calc(1rem + ${1}lh)` : "65vh",
            width: !bigEditor ? `100%` : "50vw",
            transition: "height 0.2s ease-in-out",
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
