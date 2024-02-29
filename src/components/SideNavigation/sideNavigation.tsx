import { protectedRoutes } from "@/router/routeMap";
import SidebarItem from "./sideNavItems.tsx";
import { Link } from "react-router-dom";
import TimesLogo from "@/assets/dtutimesIcon.js";
import React, { useEffect, useRef, useState } from "react";
import MenuBar from "@/assets/menubar.js";
function Sidebar() {
    const [subopen, setOpen] = React.useState(null);
    const openerFn = (index) => {
        if (index === subopen) {
            setOpen(null);
        } else {
            setOpen(index);
        }
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const menuRef = useRef(null);

    function handleMenu(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {

        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);

    }
    useEffect(() => {

        function handleOutsideClicks(e: MouseEvent) {

            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsSidebarOpen(false);
            }
        }


        document.addEventListener("mousedown", handleOutsideClicks);
        return () => {

            document.removeEventListener("mousedown", handleOutsideClicks);
        };
    }, []);
    const items = protectedRoutes[0].children;



    return (
        <div ref={menuRef} >
            <MenuBar className={`fixed left-[20px] top-2 cursor-pointer z-20`} onClick={(e) => handleMenu(e)} />
            <div className={` h-[100%] bg-[#252525] text-white w-[280px] fixed top-0 left-0  ${isSidebarOpen ? ' overflow-y-scroll overflow-x-hidden scrollbar-thumb-rounded scrollbar-thin transition-scrollbar scrollbar-thumb-gray-600   scrollbar-track-transparent hover:scrollbar-thumb-red-500 fixed transition-all duration-300' : 'fixed w-[70px] flex m-auto overflow-x-hidden overflow-auto transition-all duration-300'}`}>
                <div className="flex items-center flex-col p-3">


                    <div className="m-4 p-4">
                        <Link
                            to="/"
                            className="flex justify-center items-center"
                        >
                            <TimesLogo className={`h-20 w-[80px] absolute top-[60px] ${isSidebarOpen ? 'transition-all duration-300' : 'h-20 w-[30px] absolute left-[-5px]  transition-all duration-300'}`} />
                        </Link>
                        <div className={`p-2 text-center text-xs absolute top-[120px] left-[90px] ${isSidebarOpen ? '' : 'left-[-400px]'}`}>
                            <span className="whitespace-nowrap  ">DTU Times {new Date().getFullYear()}
                            </span>
                            <ul className="flex justify-center">

                                {/* {socialLinks.map((link, index) => (
                <li key={index}>
                  <ChevronDownIcon url={link.url} bgColor={link.bgColor} />
                </li>
              ))}
            */}
                            </ul>
                            {/* <span className={`text-xs ${isSidebarOpen ? '' : 'hidden'}`}>
                Got any issues? Contact the Developers.
              </span> */}
                        </div>
                    </div>
                    <div className={`flex-none w-64 mt-[105px] ${isSidebarOpen ? 'ml-[45px]' : ''}`}>
                        {items.map((item, index) => (
                            <div className="flex flex-col" key={`sidebar-root-${index}`}>
                                <div className={`mt-[5px]`}>
                                    <SidebarItem
                                        key={`sidebar-root-${index}`}
                                        items={item}
                                        is_expanded={index === subopen}
                                        menu_open={() => openerFn(index)}
                                        isSidebarOpen={isSidebarOpen}
                                        setIsSidebarOpen={setIsSidebarOpen}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;