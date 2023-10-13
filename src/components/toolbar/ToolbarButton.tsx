"use client"

import { Tool } from '../../lib/ToolbarItems';


type ToolbarButtonProps<T> = {
    targets: T[];
    tool: Tool<T>;
    enable: boolean;
};

export default function ToolbarButton<T>(props: ToolbarButtonProps<T>) {

    return <div
        className='bg-slate-500 p-1 px-2 text-center flex items-center rounded hover:bg-slate-600 cursor-pointer text-sm'
        onClick={() => props.enable && props.tool.invoke(props.targets)}
        style={{
            opacity: props.enable ? 1 : 0.5,
        }}
    >
        <p>{props.tool.name}</p>
    </div>;
}
