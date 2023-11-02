import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Profile from "@/components/profile/Profile";

type ProfilePageProps = {
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
      name: true;
      image: true;
    };
  }>;
};

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    res.statusCode = 403;
    return { notFound: true };
  }

  const profile = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!profile) {
    res.statusCode = 403;
    return { notFound: true };
  }

  return {
    props: {
      user: profile,
    },
  };
};

export default function ProfilePage(props: ProfilePageProps) {
  return <Profile user={props.user} />;
}
