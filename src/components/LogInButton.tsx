import { useSession } from "next-auth/react";
import Link from "next/link";


export default function LogInButton() {
    const { data: session } = useSession();
    if (session) {
        return <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 bg-slate-500 rounded-full p-2 text-base"
        >
            Log out
        </Link>;
    }
    return <Link
        href="/api/auth/signin"
        className="flex items-center gap-2 bg-slate-500 rounded-full p-2 text-base"
    >
        Log in
    </Link>;
}