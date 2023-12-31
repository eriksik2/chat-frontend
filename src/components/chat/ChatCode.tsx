"use client";

import clsx from "clsx";
import { useState } from "react";
import { FaRegClipboard } from "react-icons/fa6";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

type ChatCodeProps = {
  content: string;
  language?: string;
  classNameOverride?: {
    [key: string]: string;
  };
};

const defaultClassNameOverride: {
  [key: string]: string;
} = {
  linenumber: clsx("pr-3 select-none"),
};

export default function ChatCode(props: ChatCodeProps) {
  const classNameOverride = props.classNameOverride ?? defaultClassNameOverride;

  const [highlight, setHighlight] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  function innerRender(
    row: rendererNode,
    stylesheet: {
      [key: string]: React.CSSProperties;
    },
    key: any,
  ): React.ReactNode {
    if (row.type === "text") {
      const canHighlight =
        row.value !== undefined &&
        /^[a-zA-Z_][a-zA-Z-_0-9]*$/.test(String(row.value).trim());

      if (!canHighlight) return row.value;

      const shouldHighlight =
        canHighlight &&
        highlight !== null &&
        String(row.value).trim() === highlight.trim();

      if (!shouldHighlight)
        return (
          <span onClick={() => setHighlight(String(row.value!).trim())}>
            {row.value}
          </span>
        );

      const splits = /^(\s*)([^\s]*)(\s*\n?)$/.exec(String(row.value));
      if (splits === null) return row.value;

      return (
        <>
          {splits[1]}
          <span className={clsx(shouldHighlight && "bg-gray-300")}>
            {splits[2]}
          </span>
          {splits[3]}
        </>
      );
    } else if (row.type === "element") {
      var style: React.CSSProperties = {};
      for (const className of row.properties?.className ?? []) {
        if (stylesheet[className] !== undefined) {
          style = {
            ...style,
            ...stylesheet[className],
          };
        }
      }
      const tailwindClasses = row.properties?.className
        .map((className) => classNameOverride[className] ?? null)
        .filter((item) => item !== null);
      const className = (tailwindClasses ?? []).join(" ");
      const noClassName = className === undefined || className.length === 0;
      const noKey = row.properties?.key === undefined;
      const noStyle = Object.keys(style).length === 0;
      if (noClassName && noKey && noStyle) {
        return row.children?.map((child, key) =>
          innerRender(child, stylesheet, key),
        );
      }

      return (
        <span
          key={row.properties?.key ?? key}
          className={className}
          style={style}
        >
          {row.children?.map((child, key) =>
            innerRender(child, stylesheet, key),
          )}
        </span>
      );
    }
  }
  function render({
    rows,
    stylesheet,
    useInlineStyles,
  }: rendererProps): React.ReactNode {
    return (
      <div
        className="rounded bg-slate-100"
        tabIndex={0}
        onBlur={() => {
          setHighlight(null);
        }}
      >
        <div className="flex flex-col items-stretch overflow-x-auto">
          {rows.map((row, i) => (
            <span
              key={i}
              className="border-y border-transparent px-2 hover:border-slate-400 "
            >
              {innerRender(row, prism, i)}
            </span>
          ))}
        </div>
        <div className="flex w-full items-stretch justify-between bg-slate-400 text-slate-700">
          <div className="flex select-none items-center p-2 py-1 text-xs">
            {props.language}
          </div>
          <div className="flex items-stretch">
            <p
              className={clsx(
                "flex select-none items-center px-1 text-xs",
                showCopied ? "opacity-100" : "opacity-0",
                "transition-all duration-200 ease-in-out",
              )}
            >
              Copied to clipboard.
            </p>
            <button
              className="flex items-center bg-slate-500 p-1 text-slate-800 hover:bg-slate-600"
              onClick={() => {
                setShowCopied(true);
                setTimeout(() => {
                  setShowCopied(false);
                }, 2000);
                navigator.clipboard.writeText(props.content);
              }}
            >
              <FaRegClipboard />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SyntaxHighlighter
      showLineNumbers={true}
      language={props.language}
      renderer={render}
      style={{}}
      PreTag={"span"}
    >
      {props.content}
    </SyntaxHighlighter>
  );
}
