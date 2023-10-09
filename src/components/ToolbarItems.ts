
export interface Tool<T> {
    name: string;
    tooltip: string;
    invoke: (data: T[]) => void;
}

export function newTool<T>(opts: {
    name: string;
    tooltip?: string;
    invoke: (data: T[]) => void;
}) {
    class AnonTool implements Tool<T> {
        name = opts.name;
        tooltip = opts.tooltip || opts.name;
        invoke = opts.invoke;
    }
    return new AnonTool();
}

export default interface ToolbarItems<T extends ToolbarItems<T>> {
    getToolbarItems: () => Tool<T>[];
}