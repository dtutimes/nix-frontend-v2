import TimesLogo from "@/assets/dtutimesIcon";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import API from "@/services/API";

import { getTokenFromStorage, getUserFromJSON, getUserFromStorage } from "@/services/localStorageParser";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const { setGrantedPermissions, setUser, ready } = React.useContext(CurrUserCtx);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [params, setParams] = useSearchParams();
  const forcedLogout = params.get("forcedLogout");
  const sessionExpired = params.get("sessionExpired");
  setParams();

  useEffect(() => {
    if (ready) {
      const forced_logout = forcedLogout === "true";
      const session_expired = sessionExpired === "true";

      console.log(forcedLogout, sessionExpired);
      /** in case this causes some bad bad stuff then refer to previous commit
       * https://github.com/dtutimes/frontend_rm_v2/tree/c32b9aa09b70875f7b670a268e0abda25594163c
       * this forced_logout thingy was outside the if-ready block for some reasons i can't recall
       * so in case it causes some prob then tinker why it was written that way.. i should
       * document my thinking process as well while wiring the important parts :/
       */
      if (forced_logout) {
        API.post("/auth/logout").then(() => {
          setLoading(false);
          toast.info("You have been logged out!");
        }).catch(() => {
          setLoading(false);
          toast.info("Already logged out!");
        }).finally(() => {
          localStorage.clear();
          setGrantedPermissions(null);
          setUser(null);
        });
      } else if (session_expired) {
        localStorage.clear();
        setGrantedPermissions(null);
        setUser(null);
        setLoading(false);
        toast.error("Session expired, please login again!");
      } else if (getTokenFromStorage()) {
        const val = getUserFromStorage();
        if (!val) {
          toast.error("Session expired, please login again!");
          localStorage.clear();
        } else {
          API.get("/user/current-user")
            .then((res) => {
              const { user, permissions } = getUserFromJSON(res.data.data);
              setGrantedPermissions(permissions);
              setUser(user);
              localStorage.setItem("user", JSON.stringify(res.data.data));
              navigate("/dashboard");
            })
            .catch((e) => {
              localStorage.clear();
              setLoading(false);
              toast.error(e.response?.data?.message || e.message);
            });
        }
      } else {
        setLoading(false);
      }
    }
  }, [ready]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    setLoading(true);
    await API.post("/auth/login", { email, password })
      .then((res) => {
        const data = res.data;
        if (data.status === "success") {
          const { user, permissions } = getUserFromJSON(data.data.user);
          localStorage.setItem("token", data.data.accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          setGrantedPermissions(permissions);
          setUser(user);
          toast.success("Logged in successfully");
          navigate("/dashboard");
        } else {
          setLoading(false);
          toast.error(data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.response?.data?.message || error.message);
      });
  };

  if (loading) {
    return (
      <div className="flex w-screen h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <TimesLogo className="mx-auto h-20 w-auto bg-black" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-sm text-right mt-2">
          <button
            onClick={() => navigate("/forgot-password")}
            className="font-semibold text-gray-900 hover:text-indigo-500"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
