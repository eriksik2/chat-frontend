"use client"
import Reactive, { useReactive } from "@/util/Reactive";
import React from "react";


export class NavContextType<Tparams> extends Reactive {
    private pages: NavPage<Tparams>[] = [];
    private currentName: string | null = null;

    getCurrentPage(): NavPage<Tparams> | null {
        const name = this.getCurrentName();
        return name !== null ? (this.pages.find((item) => item.name === name) ?? null) : null;
    }

    getCurrentName(): string | null {
        return this.currentName;
    }

    setCurrentName(value: string) {
        this.currentName = value;
        this.notifyListeners();
    }

    getPages(): NavPage<Tparams>[] {
        return this.pages;
    }

    setPages(value: NavPage<Tparams>[]) {
        this.pages = value;
        this.notifyListeners();
    }
}
export const NavContext = React.createContext<NavContextType<any>>(new NavContextType());


type NavControllerProps = {
    children: React.ReactNode;
};

export default function NavController<Tparams>(props: NavControllerProps) {
    const [state] = React.useState(new NavContextType<Tparams>());
    const context = useReactive(state);

    return <NavContext.Provider value={context}>
        {props.children}
    </NavContext.Provider>;
}

export class NavPage<Tparams> {
    name: string;
    node: React.ReactElement;
    params: Tparams;

    constructor(name: string, node: React.ReactElement, params: Tparams) {
        this.name = name;
        this.node = node;
        this.params = params;
    }
}

export function navPage<Tparams>(name: string, node: React.ReactElement, params: Tparams) {
    return new NavPage(name, node, params);
}