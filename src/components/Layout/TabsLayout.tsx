
import React from "react";
import clsx from 'clsx';
import Link from "next/link";

type TabsNavParams = {
    icon: React.ReactNode;
};

type TabsNavProps = {
    children: React.ReactNode;
    pages: {
        icon: React.ReactNode;
        name: string;
        route: string;
    }[];
    showPageName?: boolean;
    tabsLocation?: "left" | "right" | "top" | "bottom";
    tabsAlign?: "start" | "center" | "end";
    tabsGap?: number;
    buttonBuilder?: (name: string, params: TabsNavParams, isPage: boolean) => React.ReactNode;
    emptyBuilder?: () => React.ReactNode;
};


// TODO looks really wonky with tabsLocation="left"
export default function TabsLayout(props: TabsNavProps) {
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


    return <div
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
            {props.pages.map((page, index) => <Link href={page.route} key={index}>
                {buttonBuilder(page.name, page, false)}
            </Link>)}
        </div>
        {props.children}
    </div>;
}

type TabButtonIndicatorProps = {
    name: string;
    icon: React.ReactNode;
    showPageName: boolean;
    isActive: boolean;
};

function TabButtonIndicator(params: TabButtonIndicatorProps) {
    const inner = <div className="flex flex-col items-center">
        {params.icon}
        {params.showPageName &&
            <p className="text-xs">{params.name}</p>
        }
    </div>;
    return <div className="m-2">
        {params.isActive ?
            <div className="p-2 px-4 rounded-full w-24 bg-slate-500 shadow-xl">
                {inner}
            </div>
            :
            <div className="p-2 px-4 w-24">
                {inner}
            </div>
        }
    </div>;
}