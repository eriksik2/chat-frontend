"use client"

import React from "react";
import NavController, { NavContext, NavPage } from "../NavController";
import NavButtons from "../NavButtons";
import NavSwitch from "../NavSwitch";

import { FaChevronRight } from "react-icons/fa6";
import TabButtonIndicator from "./TabsButtonIndicator";

import clsx from 'clsx';

type TabsNavParams = {
    icon: React.ReactNode;
};

type TabsNavProps = {
    pages: NavPage<TabsNavParams>[];
    showPageName?: boolean;
    tabsLocation?: "left" | "right" | "top" | "bottom";
    tabsAlign?: "start" | "center" | "end";
    tabsGap?: number;
    buttonBuilder?: (name: string, params: TabsNavParams, isPage: boolean) => React.ReactNode;
};



export default function TabsNav(props: TabsNavProps) {
    const showPageName = props.showPageName ?? true;
    const tabsLocation = props.tabsLocation ?? "left";

    const tabsDir = (tabsLocation === "left" || tabsLocation === "right") ? "col" : "row";
    const tabsOrder = (tabsLocation === "bottom" || tabsLocation === "right") ? "last" : "first";

    const tabsAlign = props.tabsAlign ?? (tabsDir === "col" ? "start" : "center");
    const tabsGap = props.tabsGap ?? "1rem";

    const buttonBuilder = props.buttonBuilder ?? ((name, params, isPage) => <TabButtonIndicator
        name={name}
        icon={params.icon}
        showPageName={showPageName}
        isActive={isPage}
    />);


    return <NavController<TabsNavParams>>
        <div
            className={clsx(
                "flex items-stretch flex-grow w-full h-full",
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
                        "flex-col h-full"
                        :
                        "flex-row w-full",
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
                <NavButtons<TabsNavParams>>
                    {(name, params, isPage, setPage) =>
                        <button onClick={setPage}>
                            {buttonBuilder(name, params, isPage)}
                        </button>
                    }
                </NavButtons>
            </div>
            <NavSwitch<TabsNavParams>
                pages={props.pages}
            />
        </div>
    </NavController>;
}