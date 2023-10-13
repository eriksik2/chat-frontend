import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

type ProfileProps = {
    user: Prisma.UserGetPayload<{
        select: {
            name: true,
        },
    }>;
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({ req, res }) => {
    const session = await getSession({ req });
    if (!session || !session.user) {
        res.statusCode = 403;
        return { notFound: true, };
    }

    const profile = await prisma.user.findUnique({
        where: {
            email: session.user.email ?? undefined,
        },
        select: {
            name: true,
        },
    });

    if (!profile) {
        res.statusCode = 403;
        return { notFound: true, };
    }

    return {
        props: {
            user: profile,
        },
    };
};

export default function Profile(props: ProfileProps) {
    return (
        <div>
            <h1>Profile</h1>
            <p>{props.user.name}</p>
        </div>
    );
}