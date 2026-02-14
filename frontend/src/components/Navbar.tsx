import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import logo from "../assets/skygeni_logo.jpeg";

export default function Navbar() {
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        background: "linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* Left Side - Logo + Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                overflow: "hidden",
            }}
            >
            <img
                src={logo}
                alt="SkyGeni Logo"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain" // "cover"
                }}
            />
            </Box>

          <Box sx={{ px: 1, fontWeight: 600, fontSize: { xs: 18, sm: 20, md: 26 }, opacity: 0.9 }}>
            SkyGeni
          </Box>
        </Box>

        {/* Right Side - Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>

          <IconButton color="inherit">
            <ChatBubbleOutlineIcon />
          </IconButton>

          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
