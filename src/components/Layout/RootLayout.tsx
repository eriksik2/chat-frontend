import {
  FaBars,
  FaDiscord,
  FaGithub,
  FaRegComments,
  FaXTwitter,
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

const links = (
  <>
    <Link
      href={"https://twitter.com/ErikSik"}
      className="transition-colors duration-100 hover:text-slate-500"
    >
      <FaXTwitter />
    </Link>
    <Link
      href={"https://discord.gg/thBm4EQ8SM"}
      className="transition-colors duration-100 hover:text-slate-500"
    >
      <FaDiscord />
    </Link>
  </>
);

type RootLayoutProps = {
  children: React.ReactElement;
};

export default function RootLayout(props: RootLayoutProps) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full md:hidden">
        <DrawerLayout
          headerContent={
            <div className="flex items-center justify-between ">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="chat.eriksik logo"
                  width={100 * 0.65}
                  height={75 * 0.65}
                />
              </Link>
              <Link
                className={clsx(
                  "transition-colors duration-100 hover:text-slate-500",
                  "rounded-lg border border-slate-700 px-2 py-1 text-base shadow-md",
                )}
                href={"https://donate.stripe.com/5kAdRG2Pa3QV8pO5kk"}
              >
                Donate
              </Link>
            </div>
          }
          drawerContent={
            <div className="flex h-full flex-col items-stretch justify-stretch p-4">
              <div className="flex flex-grow flex-col items-center justify-center gap-3">
                <h1 className="pb-10 text-4xl">Chat Labs</h1>
                <h3 className="text-xl">Find us on</h3>
                <div className="flex items-center justify-center gap-8 text-5xl">
                  {links}
                </div>
              </div>
              <div className="mx-auto h-px w-1/2 bg-slate-300" />
              <div className="flex flex-grow flex-col items-center justify-center gap-8">
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
              <LogInButton mobile={true} />
            </div>
          }
        >
          {props.children}
        </DrawerLayout>
      </div>
      <div className="hidden h-full flex-col items-stretch justify-stretch md:flex">
        <TabsLayout
          barClassName={clsx("bg-white shadow-lg border border-slate-200 z-20")}
          tabsLocation="top"
          tabsGap="3rem"
          before={
            <div className="py-2">
              <Link href="/">
                <Image
                  className="transition-colors duration-100 hover:text-slate-500"
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
                <div className="flex items-center gap-4 text-3xl">
                  <Link
                    className={clsx(
                      "transition-colors duration-100 hover:text-slate-500",
                      "rounded-lg border border-slate-700 px-2 py-1 text-base shadow-md",
                    )}
                    href={"https://donate.stripe.com/5kAdRG2Pa3QV8pO5kk"}
                  >
                    Donate
                  </Link>
                  {links}
                </div>
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
