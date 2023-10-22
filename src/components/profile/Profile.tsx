import { useSession } from "next-auth/react";
import Image from "next/image";

type ProfileProps = {
  user: {
    id: number;
    name: string;
    image: string | null;
  };
};

export default function Profile(props: ProfileProps) {
  const { data: session } = useSession();

  // Identity says if you are viewing your own profile, someone else's profile, or if you are not logged in
  const identity =
    session?.user?.id === props.user.id
      ? "you"
      : !session || !session.user
      ? "anon"
      : "user";

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="no-scrollbar overflow-auto">
        <div className="px-4 py-6">
          {identity === "you" ? (
            <h1 className="pb-2 text-5xl">Your profile</h1>
          ) : (
            <h1 className="pb-2 text-5xl">{props.user.name + "'"}s profile</h1>
          )}
          {props.user.image && (
            <Image
              src={props.user.image}
              alt="Profile picture"
              width={200}
              height={200}
              className="rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
