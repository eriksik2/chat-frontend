"use client"

import React from "react";
import { NavContext, NavContextType, NavPage } from "./NavController";
import { useReactive } from "@/lib/Reactive";


type NavSwitchProps<Tparams> = {
    pages: NavPage<Tparams>[];
    emptyBuilder?: () => React.ReactNode;
};

export default function NavSwitch<Tparams>(props: NavSwitchProps<Tparams>) {
    const nav = React.useContext<NavContextType<Tparams>>(NavContext);
    const _ = useReactive(nav);

    React.useEffect(() => {
        nav.setPages(props.pages);
    }, [props.pages, nav]);

    const page = props.pages.filter(page => nav.getCurrentName() === page.name);

    if (page.length === 0) {
        return props.emptyBuilder ? props.emptyBuilder() : null;
    }

    return page.map((page, i) => {
        if (nav.getCurrentName() !== page.name) return null;
        return <div
            key={i}
            className='h-full w-full'
            style={{
                display: nav.getCurrentName() === page.name ? 'block' : 'none'
            }}
        >
            {page.getNode()}
        </div>
    });
}