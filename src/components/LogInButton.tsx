import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Dropdown from "./util/Dropdown";
import { FaRegUser } from "react-icons/fa6";

type LogInButtonProps = {
  mobile?: boolean;
};

export default function LogInButton(props: LogInButtonProps) {
  const { data: session } = useSession();

  const mobile = props.mobile ?? false;

  if (session && session.user) {
    const pfp = (
      <Image
        src={session.user.image ?? "/images/placeholder-profile.png"}
        alt="Profile picture"
        width={45}
        height={45}
        className="rounded-full"
      />
    );
    return mobile ? (
      <div className="flex items-center justify-between gap-4">
        <Link href="/user/profile" className="flex items-center gap-4">
          {pfp}
          <span className="text-2xl font-semibold">{session.user.name}</span>
        </Link>
        <Link
          className="rounded-lg border border-slate-700 px-2 py-1 text-base shadow-md"
          href={"/api/auth/signout"}
        >
          Log out
        </Link>
      </div>
    ) : (
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
        {pfp}
      </Dropdown>
    );
  }

  return false ? (
    "log in"
  ) : (
    <Link
      className="flex items-center justify-center gap-4"
      href="/api/auth/signin"
    >
      <div
        className={clsx(
          "flex aspect-square items-center justify-center gap-2 rounded-full border-2 border-slate-700 p-3 text-base shadow-md",
          "transition-colors duration-100 hover:border-slate-500 hover:text-slate-500",
        )}
      >
        <FaRegUser width={45} height={45} />
      </div>
      {mobile && (
        <div className="rounded-lg border border-slate-700 px-2 py-1 text-base shadow-md">
          Log in
        </div>
      )}
    </Link>
  );
}
