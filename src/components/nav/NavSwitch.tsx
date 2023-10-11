"use client"

import React from "react";
import { NavContext, NavContextType, NavPage } from "./NavController";
import { useReactive } from "@/util/Reactive";


type NavSwitchProps<Tparams> = {
    pages: NavPage<Tparams>[];
};

export default function NavSwitch<Tparams>(props: NavSwitchProps<Tparams>) {
    const nav = React.useContext<NavContextType<Tparams>>(NavContext);
    const _ = useReactive(nav);

    React.useEffect(() => {
        nav.setPages(props.pages);
    }, [props.pages, nav]);

    return props.pages.map((page, i) => {
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