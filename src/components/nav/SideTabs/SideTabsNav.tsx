"use client"

import React from "react";
import NavController, { NavContext, NavPage } from "../NavController";
import NavButtons from "../NavButtons";
import NavSwitch from "../NavSwitch";

import { FaChevronRight } from "react-icons/fa6";
import SideTabButtonIndicator from "./SideTabsButtonIndicator";

import clsx from 'clsx';

type SideTabsNavParams = {
    icon: React.ReactNode;
};

type SideTabsNavProps = {
    pages: NavPage<SideTabsNavParams>[];
    showPageName?: boolean;
    tabsLocation?: "left" | "right" | "top" | "bottom";
    tabsAlign?: "start" | "center" | "end";
    tabsGap?: number;
};



export default function SideTabsNav(props: SideTabsNavProps) {
    const showPageName = props.showPageName ?? true;
    const tabsLocation = props.tabsLocation ?? "left";

    const tabsDir = (tabsLocation === "left" || tabsLocation === "right") ? "col" : "row";
    const tabsOrder = (tabsLocation === "bottom" || tabsLocation === "right") ? "last" : "first";

    const tabsAlign = props.tabsAlign ?? (tabsDir === "col" ? "start" : "center");
    const tabsGap = props.tabsGap ?? "1rem";


    return <NavController<SideTabsNavParams>>
        <div
            className={clsx(
                "flex items-stretch flex-grow",
                tabsDir === "row" ?
                    (tabsOrder === "first" ? "flex-col" : "flex-col-reverse")
                    :
                    (tabsOrder === "first" ? "flex-row" : "flex-row-reverse"),
            )}
        >
            <div
                className={clsx(
                    "bg-slate-400 flex flex-none",
                    tabsDir === "col" ?
                        "flex-col h-full px-2"
                        :
                        "flex-row w-full py-2",
                    tabsAlign === "center" ? "justify-center" :
                        tabsAlign === "end" ? "justify-end" :
                            "justify-start",
                )}
                style={{
                    gap: tabsGap,
                    paddingTop: tabsDir === "col" ? tabsGap : undefined,
                    paddingBottom: tabsDir === "col" ? tabsGap : undefined,
                    paddingLeft: tabsDir === "row" ? tabsGap : undefined,
                    paddingRight: tabsDir === "row" ? tabsGap : undefined,
                }}
            >
                <NavButtons<SideTabsNavParams>>
                    {(name, params, isPage, setPage) =>
                        <button onClick={setPage}>
                            <SideTabButtonIndicator
                                name={name}
                                icon={params.icon}
                                showPageName={showPageName}
                                isActive={isPage}
                            />
                        </button>
                    }
                </NavButtons>
            </div>
            <NavSwitch<SideTabsNavParams>
                pages={props.pages}
            />
        </div>
    </NavController>;
}