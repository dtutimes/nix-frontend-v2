import { protectedRoutes } from "@/router/routeMap";
import SidebarItem from "./sideNavItems.jsx";
import { Link } from "react-router-dom";
import TimesLogo from "@/assets/dtutimesIcon.js";

import { useEffect, useRef, useState } from "react";
import MenuBar from "@/assets/menubar.js";

function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef(null);

  function handleMenu(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {

    e.preventDefault();
    setIsSidebarOpen(!isSidebarOpen);

  }
  useEffect(() => {
    //function to handle clicks for sidebarmenu 
    function handleOutsideClicks(e: MouseEvent) {

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    }

    //adding event listener on component mount
    document.addEventListener("mousedown", handleOutsideClicks);
    return () => {
      // removing the listener once the component unmounts
      document.removeEventListener("mousedown", handleOutsideClicks);
    };
  }, []);
  const items = protectedRoutes[0].children;
  return (
    <div ref={menuRef}>
      <MenuBar className={`fixed left-[20px] top-2 cursor-pointer z-20`} onClick={(e) => handleMenu(e)} />

      <div className={`min-h-[100vh] bg-[#252525] text-white w-[280px] fixed ${isSidebarOpen ? 'transition-all duration-300' : 'w-[80px] overflow-hidden transition-all duration-300'}`}>

        <div className="flex flex-col p-4">



          <div className="m-4 p-4">
            <Link
              to="/"
              className="flex justify-center items-center"
            >
              <TimesLogo className={`h-20 w-[80px]  fixed top-[70px] ${isSidebarOpen ? 'transition-all duration-300' : 'h-20 w-[30px] absolute left-[-5px]  transition-all duration-300'}`} />
            </Link>
            <div className={`p-2 ml-auto text-center text-xs absolute top-[130px] left-6 ${isSidebarOpen ? '' : 'hidden'}`}>
              <span>DTU Times {new Date().getFullYear()}</span>
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
          <div className={`flex-none w-64 mt-5 mt-[100px]`}>
            {items.map((item, index) => (
              <div className="flex flex-col relative ">
                <SidebarItem key={`sidebar-root-${index}`} items={item} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
              </div>

            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;