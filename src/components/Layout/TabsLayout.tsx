import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

type TabsNavParams = {
  icon: React.ReactNode;
};

export type TabsLayoutProps = {
  children: React.ReactElement;
  pages: {
    icon: React.ReactNode;
    name: string;
    route: string;
    isActive?: (activeRoute: string, buttonRoute: string) => boolean;
  }[];
  showPageName?: boolean;
  tabsLocation?: "left" | "right" | "top" | "bottom";
  tabsAlign?: "start" | "center" | "end";
  tabsGap?: `${number}${"" | "em" | "rem" | "px"}`;
  tabBarWidth?: `${number}${"" | "em" | "rem" | "px"}` | "auto";
  before?: React.ReactNode;
  after?: React.ReactNode;
  barClassName?: string;
  scrollable?: boolean;
  buttonBuilder?: (params: {
    name: string;
    icon: React.ReactNode;
    route: string;
    isActive?: (activeRoute: string, buttonRoute: string) => boolean;
  }) => React.ReactElement;
};

type OnlyOptional<T, Args extends { [P in keyof T]?: keyof T }> = {
  [P in keyof T as T[P] extends {} ? never : P]-?: (
    props: Required<Pick<T, Args[P] & {}>>,
  ) => NonNullable<T[P]>;
};

export const TabsLayoutDefaultProps: OnlyOptional<
  TabsLayoutProps,
  {
    tabsAlign: "tabsLocation";
    buttonBuilder: "showPageName";
  }
> = {
  showPageName: () => true,
  tabsLocation: () => "left",
  tabsAlign: ({ tabsLocation }) =>
    tabsLocation === "left" || tabsLocation === "right" ? "start" : "center",
  tabsGap: () => "1rem",
  tabBarWidth: () => "auto",
  before: () => <></>,
  after: () => <></>,
  barClassName: () => "",
  scrollable: () => false,
  buttonBuilder: ({ showPageName }) =>
    defaultButtonBuilderBuilder(showPageName),
} as const;

export function getTabsLayoutProps(
  props: TabsLayoutProps,
): Required<TabsLayoutProps> {
  const showPageName =
    props.showPageName ?? TabsLayoutDefaultProps.showPageName({});
  const tabsLocation =
    props.tabsLocation ?? TabsLayoutDefaultProps.tabsLocation({});
  const tabsAlign =
    props.tabsAlign ?? TabsLayoutDefaultProps.tabsAlign({ tabsLocation });
  const tabsGap = props.tabsGap ?? TabsLayoutDefaultProps.tabsGap({});
  const tabBarWidth =
    props.tabBarWidth ?? TabsLayoutDefaultProps.tabBarWidth({});
  const before = props.before ?? TabsLayoutDefaultProps.before({});
  const after = props.after ?? TabsLayoutDefaultProps.after({});
  const barClassName =
    props.barClassName ?? TabsLayoutDefaultProps.barClassName({});
  const scrollable = props.scrollable ?? TabsLayoutDefaultProps.scrollable({});
  const buttonBuilder =
    props.buttonBuilder ??
    TabsLayoutDefaultProps.buttonBuilder({ showPageName });

  return {
    showPageName,
    tabsLocation,
    tabsAlign,
    tabsGap,
    tabBarWidth,
    before,
    after,
    barClassName,
    scrollable,
    buttonBuilder,
    children: props.children,
    pages: props.pages,
  };
}

export default function TabsLayout(_props: TabsLayoutProps) {
  const {
    showPageName,
    tabsLocation,
    tabsAlign,
    tabsGap,
    tabBarWidth,
    before,
    after,
    barClassName,
    scrollable,
    buttonBuilder,
    children,
    pages,
  } = getTabsLayoutProps(_props);

  const tabsDir =
    tabsLocation === "left" || tabsLocation === "right" ? "col" : "row";
  const tabsOrder =
    tabsLocation === "bottom" || tabsLocation === "right" ? "last" : "first";

  return (
    <div
      className={clsx(
        "flex h-full items-stretch justify-stretch",
        tabsDir === "row"
          ? tabsOrder === "first"
            ? "flex-col"
            : "flex-col-reverse"
          : tabsOrder === "first"
          ? "flex-row"
          : "flex-row-reverse",
      )}
    >
      <div className={barClassName}>
        <TabBar
          tabsDir={tabsDir}
          tabsAlign={tabsAlign}
          tabsGap={tabsGap}
          tabBarWidth={tabBarWidth}
          scrollable={scrollable}
        >
          {before}
          {pages.map((page) => {
            const elem = buttonBuilder({
              name: page.name,
              icon: page.icon,
              route: page.route,
              isActive: page.isActive,
            });
            return React.cloneElement(elem, {
              key: page.route,
            });
          })}
          {after}
        </TabBar>
      </div>
      <div className="relative flex-grow">
        <div className="no-scrollbar absolute bottom-0 left-0 right-0 top-0 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

type TabBarProps = {
  tabsDir: "row" | "col";
  tabsAlign: "start" | "center" | "end";
  tabsGap: `${number}${"" | "em" | "rem" | "px"}`;
  tabBarWidth: `${number}${"" | "em" | "rem" | "px"}` | "auto";
  children: React.ReactNode[];
  scrollable?: boolean;
};

export function TabBar(props: TabBarProps) {
  const scrollable = props.scrollable ?? false;
  const tabBarWidth =
    props.tabBarWidth === "auto" ? undefined : props.tabBarWidth;
  return (
    <div
      className={clsx(
        "flex flex-grow items-center",
        scrollable && "no-scrollbar overflow-scroll",
        props.tabsDir === "col" ? "h-full flex-col" : "flex-row",
        props.tabsAlign === "center"
          ? "justify-center"
          : props.tabsAlign === "end"
          ? "justify-end"
          : "justify-start",
      )}
      style={{
        gap: props.tabsGap,
        paddingTop: props.tabsDir === "col" ? props.tabsGap : undefined,
        paddingBottom: props.tabsDir === "col" ? props.tabsGap : undefined,
        paddingLeft: props.tabsDir === "row" ? props.tabsGap : undefined,
        paddingRight: props.tabsDir === "row" ? props.tabsGap : undefined,
        width: props.tabsDir === "col" ? tabBarWidth : undefined,
        height: props.tabsDir === "row" ? tabBarWidth : undefined,
      }}
    >
      {props.children}
    </div>
  );
}

export function defaultButtonBuilderBuilder(
  showPageName: boolean,
): (params: {
  name: string;
  icon: React.ReactNode;
  route: string;
  isActive?: (activeRoute: string, buttonRoute: string) => boolean;
}) => React.ReactElement {
  return function defaultButtonBuilder(params) {
    return (
      <DefaultTabButton
        name={params.name}
        icon={params.icon}
        showPageName={showPageName}
        route={params.route}
        isActive={params.isActive}
      />
    );
  };
}

type DefaultTabButtonProps = {
  name: string;
  icon: React.ReactNode;
  showPageName: boolean;
  route: string;
  isActive?: (activeRoute: string, buttonRoute: string) => boolean;
};

function DefaultTabButton(params: DefaultTabButtonProps) {
  const checkIsActive =
    params.isActive ??
    ((activeRoute, buttonRoute) => activeRoute.includes(buttonRoute));
  const router = useRouter();
  return (
    <Link href={params.route}>
      <div
        className={clsx(
          "border-b px-1 py-2",
          checkIsActive(router.asPath, params.route)
            ? "border-b-slate-500"
            : "border-b-transparent",
          "hover:text-gray-500",
          "transition-all",
        )}
      >
        <div className="flex flex-col items-center">
          {params.icon}
          {params.showPageName && <p className="text-xs">{params.name}</p>}
        </div>
      </div>
    </Link>
  );
}
