import Permission from "./permissions";

interface RouteElement {
    path: string;
    element: React.ReactNode;
    permission: Permission[];
    label: string;
    icon?: React.SVGProps<SVGSVGElement>,
    hide?: true;
    children?: RouteElement[];
}

export default RouteElement;