import Permission from "./permissions";

interface RouteElement {
    path: string;
    element: React.ReactNode;
    permission: Permission[];
    label: string|JSX.Element;
    icon?: React.SVGProps<SVGSVGElement>,
    hide?: true;
    children?: RouteElement[];
    customClass?: string;
}

export default RouteElement;