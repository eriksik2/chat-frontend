import {
  FaBars,
  FaDiscord,
  FaGithub,
  FaRegComments,
  FaUsersGear,
} from "react-icons/fa6";
import TabsLayout, {
  TabBar,
  TabsLayoutProps,
  getTabsLayoutProps,
} from "./TabsLayout";
import LogInButton from "../LogInButton";
import DrawerLayout from "./DrawerLayout";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

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
              <Image
                src="/logo.svg"
                alt="chat.eriksik logo"
                width={100 * 0.65}
                height={75 * 0.65}
              />
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
                  href="/chats"
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
          barClassName={clsx("bg-white shadow-lg border border-slate-200")}
          tabsLocation="top"
          tabsGap="3rem"
          before={
            <div className="py-2">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="chat.eriksik logo"
                  width={100}
                  height={75}
                />
              </Link>
            </div>
          }
          after={
            <>
              <div className="flex-grow" />
              <div className="flex items-center gap-8 text-4xl">
                <Link
                  className="text-3xl"
                  href={"https://discord.gg/thBm4EQ8SM"}
                >
                  <FaDiscord />
                </Link>
                <LogInButton />
              </div>
            </>
          }
          pages={[
            {
              name: "Chatbots",
              route: "/bots",
              isActive: (activeRoute, btnRoute) => {
                return (
                  activeRoute.startsWith("/bots") ||
                  activeRoute === "/" ||
                  activeRoute === ""
                );
              },
              icon: <FaUsersGear className="text-2xl" />,
            },
            {
              name: "Chats",
              route: "/chats",
              isActive: (activeRoute, btnRoute) => {
                return activeRoute.startsWith("/chats");
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
