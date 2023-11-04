import { useState } from "react";
import DualRangeSlider from "../util/DualRangeSlider";
import { FaTemperatureHalf, FaCaretDown, FaUserGear } from "react-icons/fa6";
import Textbox from "../util/Textbox";
import MultiSelect from "../util/MultiSelect";
import clsx from "clsx";

export type Filter = {
  search: string;
  searchDescription: boolean;
  searchSystemMessage: boolean;
  models: string[];
  temperature: [number, number];
  sortBy: "new" | "rating" | "popular" | "name";
};

export const defaultFilter: Filter = {
  search: "",
  searchDescription: true,
  searchSystemMessage: false,
  models: ["gpt-4", "gpt-3.5-turbo"],
  temperature: [0, 2],
  sortBy: "popular",
};

type ChatBotFiltersProps = {
  value: Filter;
  onChange: (value: Filter) => void;
};

export function ChatBotFilters(props: ChatBotFiltersProps) {
  const [showFilters, setShowFilters] = useState<boolean>(true);

  function reset() {
    props.onChange({
      search: "",
      searchDescription: true,
      searchSystemMessage: false,
      models: ["gpt-4", "gpt-3.5-turbo"],
      temperature: [0, 2],
      sortBy: "popular",
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <div>
        <Textbox
          className="w-full bg-gray-200"
          placeholder="Search"
          value={props.value.search}
          onChange={(value) =>
            props.onChange({
              ...props.value,
              search: value,
            })
          }
        />
        <div className="flex items-baseline justify-end gap-4 px-2 text-lg">
          <div className="place-self-start">
            <button
              className=" flex items-center gap-1 rounded px-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
              <FaCaretDown
                className={clsx(
                  "transition-transform duration-300 ease-in-out",
                  showFilters ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
          </div>
          <div className="flex-grow" />
          <div className="flex flex-col items-end gap-x-6 gap-y-0 md:flex-row">
            <div className="flex items-baseline gap-2">
              <p className="whitespace-nowrap text-end text-base sm:text-lg">
                Search description
              </p>
              <input
                type="checkbox"
                checked={props.value.searchDescription}
                onChange={(e) =>
                  props.onChange({
                    ...props.value,
                    searchDescription: e.target.checked,
                  })
                }
              />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="whitespace-nowrap text-end text-base sm:text-lg">
                Search system message
              </p>
              <input
                type="checkbox"
                checked={props.value.searchSystemMessage}
                onChange={(e) =>
                  props.onChange({
                    ...props.value,
                    searchSystemMessage: e.target.checked,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-2 p-2">
          <span className="flex flex-row items-baseline gap-4">
            <span className="flex w-32 items-baseline justify-end gap-1">
              <FaUserGear /> <span className="text-lg">Model</span>
            </span>
            <div className="w-[1px] self-stretch bg-slate-800" />
            <div className="flex flex-grow justify-center">
              <MultiSelect
                options={[
                  { label: "GPT 4", value: "gpt-4" },
                  { label: "GPT 3.5", value: "gpt-3.5-turbo" },
                ]}
                value={props.value.models}
                onChange={(value) =>
                  props.onChange({
                    ...props.value,
                    models: value,
                  })
                }
              />
            </div>
          </span>

          <span className="flex items-baseline gap-4">
            <span className="flex w-32 items-baseline justify-end gap-1">
              <FaTemperatureHalf /> <span className="text-lg">Temperature</span>
            </span>
            <div className="w-[1px] self-stretch bg-slate-800" />
            <DualRangeSlider
              min={0}
              max={2}
              value={props.value.temperature}
              onChange={(value) =>
                props.onChange({
                  ...props.value,
                  temperature: value,
                })
              }
            />
          </span>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          Sort:
          <select
            className="min-w-[4rem] rounded bg-slate-400 px-2 py-1"
            value={props.value.sortBy}
            onChange={(e) =>
              props.onChange({
                ...props.value,
                sortBy: e.target.value as any,
              })
            }
          >
            <option value="new">Newest</option>
            <option value="rating">Rating</option>
            <option value="popular">Popularity</option>
            <option value="name">A-Z</option>
          </select>
        </div>
        <button
          className={clsx(
            "bg-slate-400",
            "min-w-[4rem] rounded px-2 py-1",
            "transition-all duration-300 ease-in-out",
          )}
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
