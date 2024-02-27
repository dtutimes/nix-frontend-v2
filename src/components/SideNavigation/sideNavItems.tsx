import DownArrow from "@/assets/ChevronDownIcon";
import UpArrow from "@/assets/ChevronUpIcon";
import { PermissionProtector } from "@/components/PermissionProtector";
import RouteElement from "@/types/routeElement";
import { useState } from "react";
import { Link } from "react-router-dom";

function SidebarItem({ items, is_expanded = false, menu_open }: { items: RouteElement, is_expanded?: boolean, menu_open?: () => void }) {
  const [subopen, setsubOpen] = useState(null);
  const openerFn = (index) => {
    if (index === open) {
      setsubOpen(null);
    } else {
      setsubOpen(index);
    }
  };

  if (items.hide) { return null; }

  if (items.children) {
    return (
      <PermissionProtector permission={items.permission} silent={true}>
        <div className="flex flex-col">
          <div
            className="flex items-center justify-between text-white p-2 cursor-pointer"
            onClick={menu_open}
          >
            <div className="flex items-center">
              <span>{items.label}</span>
            </div>
            <div>{is_expanded ? <UpArrow /> : <DownArrow />}</div>
          </div>
          {is_expanded ? <div className="pl-4">
            {items.children.map((item, index) => (
              <PermissionProtector key={`nested-${item.label}.${index}`} permission={item.permission} silent={true}>
                <SidebarItem
                  items={
                    {
                      ...item,
                      path: `${items.path}${item.path}`,
                    }
                  }
                  is_expanded={subopen === index}
                  menu_open={() => openerFn(index)}
                />
              </PermissionProtector>
            ))}
          </div> : <></>
          }
        </div>
      </PermissionProtector>
    );
  } else {
    return (
      <PermissionProtector permission={items.permission} silent={true}>
        <Link to={items.path}>
          <div className="flex items-center text-white p-2 cursor-pointer hover:bg-gray-500 hover:rounded">
            <span>{items.label}</span>
          </div>
        </Link>
      </PermissionProtector>
    );
  }
}

export default SidebarItem;
