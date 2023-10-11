"use client"

import { useEffect, useState } from "react";


export default class Reactive {
    generation: number = 0;
    listeners: (() => void)[] = [];

    addListener(listener: () => void) {
        this.listeners.push(listener);
    }

    removeListener(listener: () => void) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    addReactive(reactive: Reactive) {
        this.listeners.push(() => reactive.notifyListeners());
    }

    removeReactive(reactive: Reactive) {
        this.listeners = this.listeners.filter(l => l !== (() => reactive.notifyListeners()));
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener());
        this.generation++;
    }

    clearListeners() {
        this.listeners = [];
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