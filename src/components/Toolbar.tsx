"use client"

import { useMemo } from 'react';
import ToolbarItems, { Tool } from './ToolbarItems';
import ToolbarButton from './ToolbarButton';


type ToolbarProps<T extends ToolbarItems<T>> = {
    targets: T[];
    filter?: (tool: T) => boolean;
    filterDisplay?: (count: number) => string | null;
};

export default function Toolbar<T extends ToolbarItems<T>>(props: ToolbarProps<T>) {
    const targets = useMemo(() => props.filter === undefined ? props.targets : props.targets.filter(props.filter), [props.targets, props.filter]);
    const commonTools = useMemo(() => getCommonTools(targets), [targets]);

    const filterDisplay = (props.filterDisplay ?? ((count) => null))(targets.length);
    if (targets.length === 0 && filterDisplay === null) return null;

    return <div className='flex flex-row gap-2 py-1 items-center bg-slate-400'>
        {filterDisplay !== null &&
            <p>{filterDisplay}</p>
        }
        {commonTools.map((target) => {
            var enable = true;
            if (!target.allowMultiple && targets.length > 1) enable = false;
            return <ToolbarButton
                key={target.name}
                targets={targets}
                enable={enable}
                tool={target}
            />;
        })}
    </div>;
}

function getCommonTools<T extends ToolbarItems<T>>(items: ToolbarItems<T>[]): Tool<T>[] {
    var commonTools: Set<Tool<T>> | null = null;
    for (const item of items) {
        const tools = new Set(item.getToolbarItems());
        if (commonTools === null) commonTools = tools;
        else {
            const intersect: Set<Tool<T>> = new Set();
            for (const t of commonTools) {
                if (tools.has(t)) intersect.add(t);
            }
            commonTools = intersect;
        }
    }
    if (commonTools === null) return [];
    return [...commonTools];
}