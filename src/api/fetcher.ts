import { useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import { SWRGlobalState, useSWRConfig } from "swr/_internal";

export class ApiError extends Error {
    data: any;
    status: number;

    constructor(message: string, data: any, status: number) {
        super(message);
        this.data = data;
        this.status = status;
    }
}

export function fetcherGET<T>(): (url: string) => Promise<T> {
    return async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
            const errdata = await res.text();
            throw new ApiError(errdata, errdata, res.status);
        }
        return res.json() as Promise<T>;
    };
}

export type ApiGETResponse<T> = {
    data: T | undefined;
    error: ApiError | null;
    reloading: boolean;
    mutate: KeyedMutator<T>;
};

export type ApiGETOptions<T> = {
    refreshInterval?: number | ((data: T | undefined) => number);
};

export function useApiGET<T>(url: string | null, opts?: ApiGETOptions<T>): ApiGETResponse<T> {
    const { data, error, isLoading, mutate } = useSWR<T, ApiError>(url, fetcherGET<T>(), {
        refreshInterval: opts?.refreshInterval,
    });

    return {
        data: data,
        error: error ?? null,
        reloading: isLoading,
        mutate,
    };
}

export type ApiPOSTResponse<Tbody, Tresponse> = {
    post: (body: Tbody) => Promise<Tresponse>;
    error: ApiError | null;
};


export function useApiPOST<Tbody, Tresponse>(url: string): ApiPOSTResponse<Tbody, Tresponse> {
    const swr = useSWRConfig();
    const [error, setError] = useState<ApiError | null>(null);

    async function post(body: Tbody) {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const errdata = await res.text();
            setError(new ApiError(errdata, errdata, res.status));
            throw error;
        }

        // Invalidate all pages above this one.
        // This is an assumption that I try to hold true in the API design.
        const route = url.split("/").slice(url.startsWith("/") ? 1 : 0);
        for (let i = 0; i <= route.length; i++) {
            swr.mutate("/" + route.slice(0, i).join("/"));
        }

        return res.json() as Promise<Tresponse>;
    }

    return {
        post,
        error,
    };
}


export type ApiDELETEResponse<Tbody, Tresponse> = {
    del: (body: Tbody) => Promise<Tresponse>;
    error: ApiError | null;
};


export function useApiDELETE<Tbody, Tresponse>(url: string): ApiDELETEResponse<Tbody, Tresponse> {
    const swr = useSWRConfig();
    const [error, setError] = useState<ApiError | null>(null);

    async function del(body: Tbody) {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const errdata = await res.text();
            setError(new ApiError(errdata, errdata, res.status));
            throw error;
        }

        // Invalidate all pages above this one.
        // This is an assumption that I try to hold true in the API design.
        const route = url.split("/").slice(url.startsWith("/") ? 1 : 0);
        for (let i = 0; i <= route.length; i++) {
            swr.mutate("/" + route.slice(0, i).join("/"));
        }

        return res.json() as Promise<Tresponse>;
    }

    return {
        del,
        error,
    };
}