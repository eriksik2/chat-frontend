import AIFunction from "@/state/AIFunction";
import { predefinedFunctions } from "@/state/PredefinedFunctions";
import clsx from "clsx";
import { useState } from "react";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import LoadingIcon from "../util/LoadingIcon";

type ChatFunctionCallProps = {
  name: string;
  arguments: string;
  result?: string;
};

export default function ChatFunctionCall(props: ChatFunctionCallProps) {
  const [open, setOpen] = useState(false);

  const inProgress = props.result === undefined;
  const func: AIFunction = predefinedFunctions.get(props.name)!;

  function getArgumentsKeyValue(args: string): [string, any][] {
    try {
      return Object.entries<any>(JSON.parse(args));
    } catch (e) {
      return [];
    }
  }

  return (
    <div className="m-1 overflow-hidden rounded-xl">
      <div className="flex justify-between bg-gradient-to-br from-slate-400/50 via-slate-300 to-slate-400/75 shadow-inner">
        <div className="p-2">
          {inProgress ? (
            <span className="flex items-center gap-2">
              <h3>Using {func.display_name}</h3>
              <LoadingIcon />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <h3>Used {func.display_name}</h3>
              <FaCheck className={"text-gray-500"} />
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 p-2 hover:bg-slate-500"
          onClick={() => setOpen(!open)}
        >
          <FaAngleDown
            className={clsx(
              "transition-all duration-500 ease-in-out",
              open ? "rotate-180" : "rotate-0",
            )}
            onClick={() => setOpen(!open)}
          />
          Details
        </div>
      </div>
      <div>
        {open && (
          <div className="bg-slate-700 p-2 text-gray-300">
            {func.description}
            <table className="w-full">
              <tbody>
                {getArgumentsKeyValue(props.arguments).map(
                  ([key, value], index: number) => {
                    return (
                      <tr key={index}>
                        <td className="align-tops p-2 text-right text-gray-400">
                          {key}
                        </td>
                        <td className="p-2 text-left">{value}</td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
