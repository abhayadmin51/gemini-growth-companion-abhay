import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from
"./components/ProtectedRoute";

import Journal from "./pages/Journal";
import GrowthPlan from "./pages/GrowthPlan";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
		<Route
		path="/growth-plan"
		element={
		<ProtectedRoute>
			<GrowthPlan />
		</ProtectedRoute>
		  }
/>
		<Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );

}

export default App;