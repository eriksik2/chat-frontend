import { FaGithub } from "react-icons/fa6";
import TabsLayout, { TabBar, TabsLayoutProps, defaultButtonBuilder, getTabsLayoutProps } from "./TabsLayout";
import Link from "next/link";


type RootLayoutProps = {
    children: React.ReactElement;
};

export default function RootLayout(props: RootLayoutProps) {

    var tabBar: React.ReactElement | null = null;
    var newChildren: React.ReactElement = props.children;
    if (props.children.type === TabsLayout) {
        const tabsProps = getTabsLayoutProps(props.children.props as TabsLayoutProps);
        if (tabsProps.tabsLocation === 'top' && tabsProps.tabsAlign === 'center') {
            newChildren = tabsProps.children;
            tabBar = <TabBar
                tabsDir={"row"}
                tabsAlign={"start"}
                tabsGap={tabsProps.tabsGap}
            >
                {tabsProps.pages.map((page, index) => <Link href={page.route} key={index}>
                    {tabsProps.buttonBuilder({ name: page.name, icon: page.icon, route: page.route })}
                </Link>)}
            </TabBar>;
        }
    }

    return <div className="h-full flex flex-col items-stretch justify-stretch">
        <div className='flex items-center justify-start gap-2 bg-slate-400 relative'>
            <div className="py-4 px-3">
                <h1 className='flex text-2xl gap-2'>
                    chat.eriksik
                </h1>
            </div>
            {tabBar}
            <div className='absolute top-0 bottom-0 right-0 flex text-4xl items-center gap-4 px-4'>
                <a href="https://github.com/eriksik2/chat-frontend"><FaGithub /></a>
            </div>

        </div>
        <div className="flex-grow relative">
            <div className="absolute top-0 left-0 right-0 bottom-0">
                {newChildren}
            </div>
        </div>
    </div>
};