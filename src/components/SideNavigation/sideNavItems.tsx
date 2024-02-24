import DownArrow from "@/assets/ChevronDownIcon";
import UpArrow from "@/assets/ChevronUpIcon";
import { PermissionProtector } from "@/components/PermissionProtector";
import RouteElement from "@/types/routeElement";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function SvgWrapper({ children }) {
  return <>{children}</>;
}

function SidebarItem({ items, isSidebarOpen ,setIsSidebarOpen}: { items: RouteElement, isSidebarOpen: boolean ,setIsSidebarOpen:React.Dispatch<React.SetStateAction<boolean>> }) {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleMouseOver() {
      setIsSidebarOpen(true);
    }

    function handleMouseOut() {
      setIsSidebarOpen(false);
    }

    const sidebar = sidebarRef.current;

    if (sidebar) {
      sidebar.addEventListener("mouseover", handleMouseOver);
      sidebar.addEventListener("mouseout", handleMouseOut);

      return () => {
        sidebar.removeEventListener("mouseover", handleMouseOver);
        sidebar.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, []);


  if (items.hide) { return null; }

  if (items.children) {
    return (
      <PermissionProtector permission={items.permission} silent={true}>
        <div className="flex flex-col " ref={sidebarRef}>
          <div
            className="flex items-center justify-between text-white p-2 cursor-pointer w-[240px] cursor-pointer hover:bg-gray-500 hover:rounded"
            onClick={() => setOpen(!open)}
          >
            <div className={`flex items-center `}>
              <SvgWrapper>{items.icon}</SvgWrapper>
              <span className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'hidden transition-all duration-600'}`}>
                {items.label}
              </span>
            </div>
            <div className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'opacity-0 transition-all duration-600'}`}>
              {open ? <UpArrow /> : <DownArrow />}
            </div>
          </div>
          {open ? <div className="pl-4">
            {items.children.map((item, index) => (
              <PermissionProtector key={`nested-${item.label}.${index}`} permission={item.permission} silent={true}>
                <SidebarItem
                  items={{
                    ...item,
                    path: `${items.path}${item.path}`,
                  }}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </PermissionProtector>
            ))}
          </div> : <></>}
        </div>
      </PermissionProtector>
    );
  } else {
    return (
      <PermissionProtector permission={items.permission} silent={true}>
        <div className="flex flex-row" ref={sidebarRef}>
          <Link to={items.path}>
            <div className={`flex items-center w-[240px] p-2 cursor-pointer hover:bg-gray-500 hover:rounded`}>
              <SvgWrapper>{items.icon}</SvgWrapper>
              <div className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'hidden transition-all duration-600'}`}>
                {items.label}
              </div>
            </div>

          </Link>
          
          
        </div>
      </PermissionProtector>
    );
  }
}

export default SidebarItem;
