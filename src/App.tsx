import { Spinner } from "@/components/Spinner";
import AppRoute from "@/router";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-screen h-screen">
          <Spinner size="xl" />
        </div>
      }
    >
      <ToastContainer pauseOnHover={false} />
      <AppRoute />
    </Suspense>
  );
}

export default App;
