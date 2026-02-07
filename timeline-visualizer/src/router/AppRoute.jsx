import { Route, Routes } from "react-router-dom";
import TimeLine from "../pages/TimeLine";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TimeLine />} />
    </Routes>
  );
}

export default AppRoutes;
