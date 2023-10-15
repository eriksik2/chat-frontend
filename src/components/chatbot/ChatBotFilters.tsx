import { useEffect, useState } from "react";
import DualRangeSlider from "../util/DualRangeSlider";
import { FaTemperatureHalf, FaCaretDown, FaCube, FaUserGear } from "react-icons/fa6";
import Textbox from "../util/Textbox";
import MultiSelect from "../util/MultiSelect";
import clsx from "clsx";


export type Filter = {
    search: string;
    searchDescription: boolean;
    searchSystemMessage: boolean;
    models: string[];
    temperature: [number, number];
}

type ChatBotFiltersProps = {
    value: Filter;
    onChange: (value: Filter) => void;
    realtime?: boolean;
};

export default function ChatBotFilters(props: ChatBotFiltersProps) {

    const [search, setSearch] = useState<string>("");
    const [searchDescription, setSearchDescription] = useState<boolean>(true);
    const [searchSystemMessage, setSearchSystemMessage] = useState<boolean>(false);

    const [models, setModels] = useState<string[]>([]);
    const [temperature, setTemperature] = useState<[number, number]>([0, 2]);

    const [showFilters, setShowFilters] = useState<boolean>(true);

    useEffect(() => {
        setSearch(props.value.search);
        setSearchDescription(props.value.searchDescription);
        setSearchSystemMessage(props.value.searchSystemMessage);
        setModels(props.value.models);
        setTemperature(props.value.temperature);
    }, [props.value]);

    function changed(): boolean {
        return search !== props.value.search
            || searchDescription !== props.value.searchDescription
            || searchSystemMessage !== props.value.searchSystemMessage
            || models.length !== props.value.models.length
            || models.some((model) => !props.value.models.includes(model))
            || temperature[0] !== props.value.temperature[0]
            || temperature[1] !== props.value.temperature[1];
    }

    function apply() {
        props.onChange({
            search,
            searchDescription,
            searchSystemMessage,
            models,
            temperature,
        });
    }

    function reset() {
        setSearch(props.value.search);
        setSearchDescription(props.value.searchDescription);
        setSearchSystemMessage(props.value.searchSystemMessage);
        setModels(props.value.models);
        setTemperature(props.value.temperature);
    }

    return <div className="max-w-2xl flex flex-col gap-2">

        <div>
            <Textbox
                className="w-full"
                placeholder="Search"
                value={search}
                onChange={setSearch}
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
                <div className="flex items-baseline gap-2">
                    <p>Search description</p>
                    <input
                        type="checkbox"
                        checked={searchDescription}
                        onChange={(e) => setSearchDescription(e.target.checked)}
                    />
                </div>
                <div className="flex items-baseline gap-2">
                    <p>Search system message</p>
                    <input
                        type="checkbox"
                        checked={searchSystemMessage}
                        onChange={(e) => setSearchSystemMessage(e.target.checked)}
                    />
                </div>
            </div>
        </div>


        {showFilters && <div className="flex flex-col gap-2 p-2">
            <span className="flex items-baseline gap-4">
                <span className="flex items-baseline justify-end gap-1 w-32">
                    <FaUserGear /> <span className="text-lg">Model</span>
                </span>
                <div className="self-stretch w-[1px] bg-slate-800 mr-9" />
                <MultiSelect
                    options={[
                        { label: "GPT 4", value: "gpt-4" },
                        { label: "GPT 3.5", value: "gpt-3.5-turbo" },
                    ]}
                    value={models}
                    onChange={setModels}
                />
            </span>

            <span className="flex items-baseline gap-4">
                <span className="flex items-baseline justify-end gap-1 w-32">
                    <FaTemperatureHalf /> <span className="text-lg">Temperature</span>
                </span>
                <div className="self-stretch w-[1px] bg-slate-800" />
                <DualRangeSlider
                    min={0}
                    max={2}
                    value={temperature}
                    onChange={setTemperature}
                />
            </span>
        </div>}

        <div className="flex justify-end gap-2">
            <button
                className={clsx(
                    changed()
                        ? "bg-slate-400"
                        : "bg-slate-500 text-gray-800",
                    "rounded px-2 py-1 min-w-[4rem]",
                    "transition-all duration-300 ease-in-out",
                )}
                disabled={!changed()}
                onClick={reset}
            >
                Reset
            </button>
            <button
                className={clsx(
                    changed()
                        ? "bg-blue-500"
                        : "bg-slate-500 text-gray-800",
                    "rounded px-2 py-1 min-w-[4rem]",
                    "transition-all duration-300 ease-in-out",
                )}
                disabled={!changed()}
                onClick={apply}
            >
                Apply
            </button>
        </div>
    </div>;
}


type ChatBotFiltersRealtimeProps = {
    value: Filter;
    onChange: (value: Filter) => void;
};

export function ChatBotFiltersRealtime(props: ChatBotFiltersRealtimeProps) {
    const [showFilters, setShowFilters] = useState<boolean>(true);

    function reset() {
        props.onChange({
            search: "",
            searchDescription: true,
            searchSystemMessage: false,
            models: ["gpt-4", "gpt-3.5-turbo"],
            temperature: [0, 2],
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
                <div className="flex items-baseline gap-2">
                    <p>Search description</p>
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
                    <p>Search system message</p>
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


        {showFilters && <div className="flex flex-col gap-2 p-2">
            <span className="flex items-baseline gap-4">
                <span className="flex items-baseline justify-end gap-1 w-32">
                    <FaUserGear /> <span className="text-lg">Model</span>
                </span>
                <div className="self-stretch w-[1px] bg-slate-800 mr-9" />
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

        <div className="flex justify-end gap-2">
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