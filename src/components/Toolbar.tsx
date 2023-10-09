"use client"

import { useMemo } from 'react';
import ToolbarItems, { Tool } from './ToolbarItems';
import ToolbarButton from './ToolbarButton';


type ToolbarProps<T extends ToolbarItems<T>> = {
    targets: ToolbarItems<T>[];
};

export default function Toolbar<T extends ToolbarItems<T>>(props: ToolbarProps<T>) {
    const commonTools = useMemo(() => getCommonTools(props.targets), [props.targets]);
    return <div className='flex flex-row w-full gap-2 p-2 bg-slate-400'>
        {commonTools.map((target) => {
            return <ToolbarButton
                key={target.name}
                targets={props.targets as T[]}
                tool={target}
            />;
        })}
    </div>;
}

function getCommonTools<T extends ToolbarItems<T>>(items: ToolbarItems<T>[]): Tool<T>[] {
    var commonTools: Set<Tool<T>> | null = null;
    for (const item of items) {
        const tools = new Set(item.getToolbarItems());
        if(commonTools === null) commonTools = tools;
        else {
            const intersect: Set<Tool<T>> = new Set();
            for(const t of commonTools) {
                if(tools.has(t)) intersect.add(t);
            }
            commonTools = intersect;
        }
    }
    if(commonTools === null) return [];
    return [...commonTools];
}