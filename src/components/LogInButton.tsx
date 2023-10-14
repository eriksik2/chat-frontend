import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";


export default function LogInButton() {
    const { data: session } = useSession();

    return <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
        <div className={clsx(
            "flex items-center gap-2 bg-gradient-to-br from-slate-400/40 to-slate-400/80 shadow-inner rounded-full p-2 px-4 text-base",
            "hover:bg-gradient-to-br hover:from-slate-500/50 hover:via-slate-400 hover:to-slate-500/75"
        )}>
            {session ? "Log out" : "Log in"}
        </div>
    </Link>;
}