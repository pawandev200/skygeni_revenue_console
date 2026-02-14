import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ background: "#f4f6f8", minHeight: "100vh" }}>
      <Navbar />
      <Dashboard />
    </Box>
  );
}

export default App;

