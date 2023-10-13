"use client"
import React from "react";
import { NavContext, NavContextType, NavPage } from "./NavController";
import { useReactive } from "@/lib/Reactive";


type NavButtonsProps<Tparams> = {
    children: (name: string, params: Tparams, isPage: boolean, setPage: () => void) => React.ReactElement;
};

export default function NavButtons<Tparams>(props: NavButtonsProps<Tparams>) {
    const nav = React.useContext<NavContextType<Tparams>>(NavContext);
    const _ = useReactive(nav);

    return <>
        {nav.getPages().map((page, i) => {
            const node = props.children(page.name, page.params, nav.getCurrentName() === page.name, () => nav.setCurrentName(page.name));
            return React.cloneElement(node as React.ReactElement, { key: i });
        })}
    </>;
}