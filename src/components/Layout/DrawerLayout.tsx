import { useState } from "react";
import { FaBars, FaX } from "react-icons/fa6";


type DrawerLayoutProps = {
    headerContent: React.ReactNode;
    drawerContent: React.ReactNode;
    children: React.ReactNode;
};

export default function DrawerLayout(props: DrawerLayoutProps) {

    const [open, setOpen] = useState(false);

    return <div className="relative h-full w-full overflow-hidden">
        <div
            className="flex flex-col items-stretch h-full"
            style={{
                transition: "all 0.2s ease-in-out",
                transformOrigin: "center",
                transform: !open
                    ? "translateX(0)"
                    : "perspective(500px) scale(0.95)",
            }}
        >
            <div className="flex items-center p-3 px-4">
                {props.headerContent}
                <div className="flex-grow" />
                <button
                    className=""
                    onClick={() => setOpen(!open)}
                >
                    <FaBars className="text-2xl" />
                </button>
            </div>
            <div className="flex-grow relative">
                <div className="absolute top-0 left-0 right-0 bottom-0 overflow-auto no-scrollbar">
                    {props.children}
                </div>
            </div>
        </div>
        <div
            className="absolute top-0 bottom-0 left-0 right-0 z-40"
            style={{
                pointerEvents: open ? "auto" : "none",
                backgroundColor: open ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0)",
                transition: "all 0.2s ease-in-out",
            }}
        >
            <div
                className="pl-28 w-full h-full"
                style={{
                    transition: "all 0.2s ease-in-out",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                }}
                onClick={(e) => e.target === e.currentTarget && setOpen(false)}
            >
                <div className="bg-slate-300 w-full h-full flex flex-col">
                    <div className="flex items-center p-3 px-4">
                        <div className="invisible">{props.headerContent}</div>
                        <div className="flex-grow" />
                        <button onClick={() => setOpen(false)}>
                            <FaX className="text-2xl" />
                        </button>
                    </div>
                    <div className="flex flex-col justify-center items-center flex-grow">
                        {props.drawerContent}
                    </div>
                </div>
            </div>
        </div>
    </div>;
}