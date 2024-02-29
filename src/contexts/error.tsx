import React from "react";
import { CustomError, ErrorCtxType } from "@/types/contextTypes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ErrorContext = React.createContext<ErrorCtxType | null>(null);

const ErrorCtxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const setError = (data: CustomError) => {
    if (axios.isAxiosError(data)) {
      const err_code = data?.response?.status;
      if (err_code) {
        switch (err_code) {
          case 401:
            navigate("/login?sessionExpired=true");
            break;
          case 403:
            toast.error(
              "Permission denied by the server! Relogin to update permissions if you feel this is a mistake.",
            );
            break;
          default:
            toast.error(
              data?.response?.data?.message ||
                data?.message ||
                "An error occurred!",
            );
        }
      }
    } else {
      toast.error(data?.message || "An error occurred!");
    }
  };

  return (
    <ErrorContext.Provider
      value={{
        setError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorCtxProvider;
