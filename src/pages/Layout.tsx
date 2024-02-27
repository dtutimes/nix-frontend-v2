import SideNavigation from "@/components/SideNavigation/sideNavigation";


const Layout = ({ children }) => {
  return (
    <div className="flex">
      <div className="mr-[60px] z-40 "><SideNavigation /></div>
    
      <main className="flex-grow bg-[var(--bg-color)] p-4">
        {children}
      </main>
      
    </div>
  );
};

export default Layout;
