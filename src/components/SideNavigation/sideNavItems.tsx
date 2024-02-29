
import DownArrow from "@/assets/ChevronDownIcon";
import UpArrow from "@/assets/ChevronUpIcon";
import { PermissionProtector } from "@/components/PermissionProtector";
import RouteElement from "@/types/routeElement";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
    items: RouteElement;
    is_expanded?: boolean; 
    menu_open?: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SvgWrapper({ children }) {
    return <>{children}</>;
}
function SidebarItem({
    items,
    is_expanded = false,
    menu_open,
    isSidebarOpen,
    setIsSidebarOpen,
}: SidebarItemProps) {
    const [subopen, setsubOpen] = useState(null);
    const openerFn = (index) => {
        if (index === open) {
            setsubOpen(null);
        } else {
            setsubOpen(index);
        }
    };

    useEffect(() => {
        // Close the moremenu items when the sidebar is closed
        if (!isSidebarOpen) {
            setsubOpen(false);
        }
    }, [isSidebarOpen]);

    if (items.hide) {
        return null;
    }

    if (items.children) {
        return (
            <PermissionProtector permission={items.permission} silent={true}>
                <div className="flex flex-col">
                    <div
                        className={`flex items-center justify-between text-white p-2 cursor-pointer w-[220px] h-[45px] ${isSidebarOpen ? 'hover:bg-gray-500 hover:rounded transition-all duration-600' : 'w-[45px] transition-all duration-600'}`}
                        onClick={menu_open}

                    >
                        <div className="flex items-center">
                            <div onClick={() => setIsSidebarOpen(true)} className={`${isSidebarOpen ? 'transition-all duration-800' : 'scale-[1.5] transition-all duration-800  hover:bg-gray-500 hover:rounded w-[29px] h-[30px] flex justify-center items-center'}`}><SvgWrapper>{items.icon}</SvgWrapper>
                            </div>
                            <span className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'hidden transition-all duration-600'}`}>
                                {items.label}
                            </span>
                        </div>
                        <div className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'hidden transition-all duration-600'}`}>
                            {is_expanded ? <UpArrow /> : <DownArrow />}
                        </div>
                    </div>
                    {isSidebarOpen && is_expanded ? (
                        <div className="pl-4">
                            {items.children.map((item, index) => (
                                <PermissionProtector
                                    key={`nested-${item.label}.${index}`}
                                    permission={item.permission}
                                    silent={true}
                                >
                                    <SidebarItem
                                        items={{
                                            ...item,
                                            path: `${items.path}${item.path}`,
                                        }}
                                        is_expanded={subopen === index}
                                        menu_open={() => openerFn(index)}
                                        isSidebarOpen={isSidebarOpen}
                                        setIsSidebarOpen={setIsSidebarOpen}
                                    />
                                </PermissionProtector>
                            ))}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </PermissionProtector>
        );
    } else {
        return (
            <>
                <PermissionProtector permission={items.permission} silent={true}>
                    <div className="flex flex-row" id={items.customClass}>
                        <Link to={items.path}>
                            <div className={`flex items-center w-[220px] h-[45px]  p-2 cursor-pointer   ${isSidebarOpen ? 'hover:bg-gray-500 hover:rounded transition-all duration-600' : 'w-[45px] transition-all duration-600'}`}>
                                <span className={`${isSidebarOpen ? 'transition-all duration-800' : 'scale-[1.5] transition-all duration-800  hover:bg-gray-500 hover:rounded w-[40px] h-[30px] flex justify-center items-center'}`}><SvgWrapper>{items.icon}</SvgWrapper></span>
                                <div className={`ml-3 ${isSidebarOpen ? 'transition-all duration-600' : 'hidden transition-all duration-600'}`}>
                                    {items.label}
                                </div>
                            </div>
                        </Link>
                    </div>


                </PermissionProtector>

            </>
        );
    }
}

export default SidebarItem;