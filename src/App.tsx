import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import WrappedPage from "./components/Wrapped/WrappedPage/WrappedPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/wrapped" element={<WrappedPage />} />
    </Routes>
  );
}
