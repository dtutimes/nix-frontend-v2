// use : <Collapsible label="your_label"> children </Collapsible>
import ChevronDownIcon from "@/assets/ChevronDownIcon";

export default function Collapsible (props : {label: string, children: React.ReactNode}) {
  return (
    <div className="max-w-4xl mx-auto py-2">
      <details className="bg-primaryBg rounded-md border-b">
        <summary className="flex justify-between items-center p-4 cursor-pointer">
          <h2 className="text-xl font-medium">{props.label}</h2>
          <ChevronDownIcon className="text-gray-400" />
        </summary>
        <div className="p-4 border-l-4 border-blue-500">
          {props.children}
        </div>
      </details>
    </div>
  );
}
