"use client"

import { Tool } from './ToolbarItems';


type ToolbarButtonProps<T> = {
    targets: T[];
    tool: Tool<T>;
};

export default function ToolbarButton<T>(props: ToolbarButtonProps<T>) {

    return <div
        className='aspect-square bg-slate-500 p-2 text-center flex items-center rounded hover:bg-slate-600 cursor-pointer'
        onClick={() => props.tool.invoke(props.targets)}
    >
        <p>{props.tool.name}</p>
    </div>;
}
