import Collapsible from "@/components/Collapsible";
import { Spinner } from "@/components/Spinner";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import Permission from "@/types/permissions";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import DeleteIcon from "@/assets/DeleteIcon";

export default function AllRoles() {
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setError } = useContext(ErrorContext);

  const handleDelete = (roleId) => {
    const choice = window.confirm(
      "Are you sure you want to delete this role?"
    );
    if (choice) {
      const deleteEndPoint = `/role/delete/${roleId}`;

      API.delete(deleteEndPoint)
        .then(() => {
          toast.success("Successfully deleted");
          fetchRoles();
        })
        .catch((e) => setError(e));
    }
  };

  const fetchRoles = () => {
    const rolesEndpoint = "/role";

    API.get(rolesEndpoint)
      .then((rolesResponse) => {
        setRolesList(rolesResponse.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-semibold text-center">All Roles</h1>
      <p className="text-lg text-center mt-4 mb-10">
        Everyone has a different role in Times. Hence different usage of the website.
      </p>
      {loading ? (
        <div className="flex w-full h-full justify-center items-center"><Spinner /></div>
      ) : (
        <div >
          {rolesList.map((role) => (
            <div key={role.role_id}>
              <Collapsible label={role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1).toLowerCase()}>
                <h4>
                  <ol className="flex flex-wrap gap-2 list-none">
                    {role.permissions.map((permissionId) => (
                      <li className="text-lg bg-blue-500 rounded-full px-3 py-1" key={permissionId}>{Permission[permissionId]} </li>
                    ))}
                  </ol>
                </h4>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleDelete(role.role_id)}
                    type="button" 
                    className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 ">
                    <DeleteIcon />
                  </button>
                </div>
              </Collapsible>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
