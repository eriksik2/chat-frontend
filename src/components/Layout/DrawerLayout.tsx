import { useState } from "react";
import { FaBars, FaX } from "react-icons/fa6";

type DrawerLayoutProps = {
  headerContent: React.ReactNode;
  drawerContent: React.ReactNode;
  children: React.ReactNode;
};

export default function DrawerLayout(props: DrawerLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="flex h-full flex-col items-stretch"
        style={{
          transition: "all 0.2s ease-in-out",
          transformOrigin: "center",
          transform: !open ? "translateX(0)" : "perspective(500px) scale(0.95)",
        }}
      >
        <div className="flex items-center px-4 py-3">
          <div className="flex-grow">{props.headerContent}</div>
          <button className="pl-4" onClick={() => setOpen(!open)}>
            <FaBars className="text-2xl" />
          </button>
        </div>
        <div className="relative flex-grow">
          <div className="no-scrollbar absolute bottom-0 left-0 right-0 top-0 overflow-auto">
            {props.children}
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 top-0 z-40"
        style={{
          pointerEvents: open ? "auto" : "none",
          backgroundColor: open ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <div
          className="h-full w-full pl-28 sm:pl-72"
          style={{
            transition: "all 0.2s ease-in-out",
            transform: open ? "translateX(0)" : "translateX(100%)",
          }}
          onClick={(e) => setOpen(false)}
        >
          <div className="flex h-full w-full flex-col bg-white shadow-xl">
            <div className="flex items-center p-3 px-4">
              <div className="invisible">{props.headerContent}</div>
              <div className="flex-grow" />
              <button onClick={() => setOpen(false)}>
                <FaX className="text-2xl" />
              </button>
            </div>
            <div className="flex-grow">{props.drawerContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
