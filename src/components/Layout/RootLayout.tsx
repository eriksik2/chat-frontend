import { FaBars, FaGithub, FaRegComments, FaUsersGear } from "react-icons/fa6";
import TabsLayout, {
  TabBar,
  TabsLayoutProps,
  getTabsLayoutProps,
} from "./TabsLayout";
import LogInButton from "../LogInButton";
import DrawerLayout from "./DrawerLayout";
import Link from "next/link";

type RootLayoutProps = {
  children: React.ReactElement;
};

export default function RootLayout(props: RootLayoutProps) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full sm:hidden">
        <DrawerLayout
          headerContent={
            <Link href="/">
              <h1 className="flex gap-2 text-2xl">chat.eriksik</h1>
            </Link>
          }
          drawerContent={
            <>
              <div className="h-36" />
              <div className="flex flex-col gap-2">
                <Link
                  href="/bots"
                  className="flex w-full justify-center gap-4 text-2xl"
                >
                  <FaUsersGear className="text-2xl" />
                  Chatbots
                </Link>
                <Link
                  href="/api/chats/latest?redirect=true"
                  className="flex w-full justify-center gap-4 text-2xl"
                >
                  <FaRegComments className="text-2xl" />
                  Chats
                </Link>
              </div>
              <div className="h-36" />
              <LogInButton />
            </>
          }
        >
          {props.children}
        </DrawerLayout>
      </div>
      <div className="hidden h-full flex-col items-stretch justify-stretch sm:flex">
        <TabsLayout
          tabsLocation="top"
          before={
            <div className="px-3 py-4">
              <Link href="/">
                <h1 className="flex gap-2 text-3xl">chat.eriksik</h1>
              </Link>
            </div>
          }
          after={
            <>
              <div className="flex-grow" />
              <div className="flex items-center gap-4 px-4 text-4xl">
                <LogInButton />
                <a href="https://github.com/eriksik2/chat-frontend">
                  <FaGithub />
                </a>
              </div>
            </>
          }
          pages={[
            {
              name: "Chatbots",
              route: "/bots",
              icon: <FaUsersGear className="text-2xl" />,
            },
            {
              name: "Chats",
              route: "/api/chats/latest?redirect=true",
              isActive: (activeRoute, btnRoute) => {
                return activeRoute.includes("/chats/");
              },
              icon: <FaRegComments className="text-2xl" />,
            },
          ]}
        >
          {props.children}
        </TabsLayout>
      </div>
    </div>
  );
}
