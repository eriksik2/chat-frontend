import { FaChevronRight } from "react-icons/fa6";


type TabButtonIndicatorProps = {
    name: string;
    icon: React.ReactNode;
    showPageName: boolean;
    isActive: boolean;
};

export default function TabButtonIndicator(params: TabButtonIndicatorProps) {
    const inner = <div className="flex flex-col items-center">
        {params.icon}
        {params.showPageName &&
            <p className="text-xs">{params.name}</p>
        }
    </div>;
    return <div className="m-2">
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