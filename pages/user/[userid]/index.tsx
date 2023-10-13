
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
import { useRouter } from 'next/router';

type UserProps = {
    userObject: Prisma.UserGetPayload<{
        select: {
            name: true;
        },
    }> | null;
};


export const getStaticProps: GetStaticProps<UserProps> = (async ({ params }) => {
    if (typeof params?.userid !== "string") {
        return { props: { userObject: null, }, };
    }
    const userid: number = parseInt(params?.userid);

    const userObject = await prisma.user.findUnique({
        where: {
            id: userid,
        },
        select: {
            name: true,
        },
    });

    return {
        props: {
            userObject: userObject,
        },
        revalidate: 10,
    };
});

export async function getStaticPaths() {
    return {
        paths: [
        ],
        fallback: false,
    };
}

export default function User(props: UserProps) {

    return (
        <div>
            <h1>User {props.userObject?.name ?? "not found."}</h1>
        </div>
    );
}