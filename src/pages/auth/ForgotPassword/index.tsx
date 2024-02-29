import TimesLogo from "@/assets/dtutimesIcon";
import API from "@/services/API";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { ErrorContext } from "@/contexts/error";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { setError } = useContext(ErrorContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);

    // Make a request to the backend API to initiate the forgot password process
    const toast_id = toast.loading("Sending reset email!");
    await API.post("/auth/forgotPassword", { email })
      .then(() => {
        setLoading(false);
        toast.success("Password reset email sent");
      })
      .catch((e) => {
        setLoading(false);
        setError(e);
      })
      .finally(() => toast.done(toast_id));
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <TimesLogo className="mx-auto h-20 w-auto bg-black" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Your Password?
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-white disabled:text-gray-700 disabled:opacity-20 disabled:border-gray-100 disabled:shadow-current disabled:shadow-md"
            >
              Send Reset Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
