import { FaChevronRight } from "react-icons/fa6";


type SideTabButtonIndicatorProps = {
    name: string;
    icon: React.ReactNode;
    showPageName: boolean;
    isActive: boolean;
};

export default function SideTabButtonIndicator(params: SideTabButtonIndicatorProps) {
    const inner = <div className="flex flex-col items-center">
        {params.icon}
        {params.showPageName &&
            <p className="text-xs">{params.name}</p>
        }
    </div>;
    return <div className="">
        {params.isActive ?
            <div className="p-2 px-4 rounded-full w-24 bg-slate-500 shadow-xl">
                {inner}
            </div>
            :
            <div className="p-2 px-4 w-24">
                {inner}
            </div>
        }
    </div>;
}