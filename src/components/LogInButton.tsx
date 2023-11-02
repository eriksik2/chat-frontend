import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Dropdown from "./util/Dropdown";

export default function LogInButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <Dropdown
        dropdown={
          <div className="flex flex-col items-stretch py-2 text-base">
            <Link
              href="/user/profile"
              className="px-2 py-2 transition-colors duration-100 hover:bg-slate-200/75"
            >
              Profile
            </Link>
            <Link
              href="/api/auth/signout"
              className="px-2 py-2 transition-colors duration-100 hover:bg-slate-200/75"
            >
              Log out
            </Link>
          </div>
        }
      >
        <Image
          src={session.user.image ?? "/images/placeholder-profile.png"}
          alt="Profile picture"
          width={40}
          height={40}
          className="rounded-full"
        />
      </Dropdown>
    );
  }

  return (
    <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
      <div
        className={clsx(
          "flex items-center gap-2 rounded-full bg-gradient-to-br from-slate-400/40 to-slate-400/80 p-2 px-4 text-base shadow-inner",
          "hover:bg-gradient-to-br hover:from-slate-500/50 hover:via-slate-400 hover:to-slate-500/75",
        )}
      >
        {session ? "Log out" : "Log in"}
      </div>
    </Link>
  );
}
