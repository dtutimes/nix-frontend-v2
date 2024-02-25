export default function Table({ headers, content}) {
  console.log(content);
  // todo: use these functions onDelete & onEdit or remove them
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="border-b text-left">
          {headers.map((header, index) => (
            <th key={index} scope="col" className="p-4">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {content.length ? content.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} scope="row" className="p-4">
                {cell}
              </td>
            ))}
          </tr>
        )) : <tr className="border-b"><td colSpan={headers.length}><h2 className="text-xl text-center font-bold my-10"> That thing you&apos;re looking for? It doesn&apos;t exist yet </h2></td></tr>}
      </tbody>
    </table>
  );
}