
import { Spinner } from "@/components/Spinner";
import { getTokenFromStorage, getUserFromStorage } from "@/services/localStorageParser";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getTokenFromStorage();
    const user = getUserFromStorage();
    if (token && user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <Spinner />
    </div>
  );
};

export default HomePage;
