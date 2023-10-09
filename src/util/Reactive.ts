"use client"

import { useEffect, useState } from "react";


export default class Reactive {
    listeners: (() => void)[] = [];

    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}


export function useReactive<T extends Reactive>(reactive: T) {
    const [forceReloadHack, setForceReloadHack] = useState<number>(0);
    function listener() {
        setForceReloadHack(v => v + 1);
    }
    useEffect(() => {
        reactive.listeners.push(listener);
        return () => {
            reactive.listeners = reactive.listeners.filter(l => l !== listener);
        }
    }, [reactive]);
    return reactive;
}