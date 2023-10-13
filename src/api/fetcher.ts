import { useState } from "react";
import useSWR, { KeyedMutator } from "swr";

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
        const data = await res.json() as T;
        return data;
    };
}

export type ApiGETResponse<T> = {
    data: T | null;
    error: ApiError | null;
    reloading: boolean;
    mutate: KeyedMutator<T>;
};

export function useApiGET<T>(url: string): ApiGETResponse<T> {
    const { data, error, isLoading, mutate } = useSWR<T, ApiError>(url, fetcherGET<T>());

    return {
        data: data ?? null,
        error: error ?? null,
        reloading: isLoading,
        mutate,
    };
}

export type ApiPOSTResponse<Tbody, Tresponse> = {
    post: (body: Tbody) => Promise<Tresponse>;
    error: ApiError | null;
};

export function fetcherPOST<T>(): (url: string, body: T) => Promise<T> {
    return async (url: string, body: T) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

        });
        if (!res.ok) {
            const errdata = await res.text();
            throw new ApiError(errdata, errdata, res.status);
        }
        const data = await res.json() as T;
        return data;
    };
}

export function useApiPOST<Tbody, Tresponse>(url: string): ApiPOSTResponse<Tbody, Tresponse> {
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
        const data = await res.json() as Tresponse;
        return data;
    }

    return {
        post,
        error,
    };
}