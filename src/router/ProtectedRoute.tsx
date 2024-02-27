import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { PermErrCtx } from "@/contexts/permission_error";
import Permission from "@/types/permissions";
import React, { useEffect } from "react";
import { Navigate, useNavigate, useRoutes } from "react-router-dom";
import { protectedRoutes } from "./routeMap";


const ProtectedRoute = () => {
  const { failedPermissions, setFailedPermissions } = React.useContext(PermErrCtx);
  const { user, ready } = React.useContext(CurrUserCtx);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (ready) {
      if (!user) {
        setLoading(false);
        navigate("/login?sessionExpired=true");
        return;
      }
      setLoading(false);
    }
  }, [ready]);

  const element = useRoutes([...protectedRoutes]);

  if (loading) { return <div className="flex w-full h-full justify-center items-center"><Spinner /></div>; }
  if (!loading && ready && !user) { return <Navigate to="/login" />; }

  return (
    <>
      {failedPermissions !== null && failedPermissions.length > 0 ?
        <div className='flex  justify-center items-center h-screen'>
          <div className='p-6 border-l-rose-700 border-4 border-l-8 rounded-e-xl'>
            The following permissions were not met for this action:
            <ul>
              {failedPermissions.map((err, index) => {
                return <li className='ml-4 p-2' key={index}>&gt; {Permission[err]}</li>;
              })}
            </ul>
            <button
              className='rounded-xl border-black border-2 bg-slate-400 px-4 py-2 mt-6'
              onClick={() => {
                setFailedPermissions(null);
                navigate(-1);
              }}
            >
              Okay
            </button>
          </div>
        </div> : element
      }
    </>);
};

export default ProtectedRoute;
