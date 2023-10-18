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
    sortBy: "newest" | "rating" | "popular" | "name";
}

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

    return <div className="max-w-2xl flex flex-col gap-2">
        <div>
            <Textbox
                className="w-full"
                placeholder="Search"
                value={props.value.search}
                onChange={(value) => props.onChange({
                    ...props.value,
                    search: value,
                })}
            />
            <div className="flex items-baseline justify-end gap-4 px-2 text-lg">
                <div className="place-self-start">
                    <button
                        className=" px-2 rounded flex items-center gap-1"
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
                <div className="flex gap-y-0 gap-x-6 flex-col items-end md:flex-row">
                    <div className="flex items-baseline gap-2">
                        <p className="text-end whitespace-nowrap text-base sm:text-lg">Search description</p>
                        <input
                            type="checkbox"
                            checked={props.value.searchDescription}
                            onChange={(e) => props.onChange({
                                ...props.value,
                                searchDescription: e.target.checked,
                            })}
                        />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-end whitespace-nowrap text-base sm:text-lg">Search system message</p>
                        <input
                            type="checkbox"
                            checked={props.value.searchSystemMessage}
                            onChange={(e) => props.onChange({
                                ...props.value,
                                searchSystemMessage: e.target.checked,
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>


        {showFilters && <div className="flex flex-col gap-2 p-2">
            <span className="flex items-baseline gap-4 flex-row">
                <span className="flex items-baseline justify-end gap-1 w-32">
                    <FaUserGear /> <span className="text-lg">Model</span>
                </span>
                <div className="self-stretch w-[1px] bg-slate-800" />
                <div className="flex-grow flex justify-center">
                    <MultiSelect
                        options={[
                            { label: "GPT 4", value: "gpt-4" },
                            { label: "GPT 3.5", value: "gpt-3.5-turbo" },
                        ]}
                        value={props.value.models}
                        onChange={(value) => props.onChange({
                            ...props.value,
                            models: value,
                        })}
                    />
                </div>
            </span>

            <span className="flex items-baseline gap-4">
                <span className="flex items-baseline justify-end gap-1 w-32">
                    <FaTemperatureHalf /> <span className="text-lg">Temperature</span>
                </span>
                <div className="self-stretch w-[1px] bg-slate-800" />
                <DualRangeSlider
                    min={0}
                    max={2}
                    value={props.value.temperature}
                    onChange={(value) => props.onChange({
                        ...props.value,
                        temperature: value,
                    })}
                />
            </span>
        </div>}

        <div className="flex justify-between gap-2">
            <div className="flex gap-2 items-center">
                Sort:
                <select
                    className="bg-slate-400 rounded px-2 py-1 min-w-[4rem]"
                    value={props.value.sortBy}
                    onChange={(e) => props.onChange({
                        ...props.value,
                        sortBy: e.target.value as any,
                    })}
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
                    "rounded px-2 py-1 min-w-[4rem]",
                    "transition-all duration-300 ease-in-out",
                )}
                onClick={reset}
            >
                Reset
            </button>
        </div>
    </div>;
}