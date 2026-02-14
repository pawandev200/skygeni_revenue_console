import { Box, Divider} from "@mui/material";
import type { Summary } from "../types"; 

interface Props {
  data: Summary;
}

export default function QtdHeader({ data }: Props) {
  return (
    <Box
      sx={{
        background: "linear-gradient(90deg, #16367a 0%, #112a5d 100%)",
        color: "white",
        py: { xs: 2, md: 1.5 },
        px: { xs: 2, sm: 4, md: 5 },
        borderRadius: 2,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: { xs: "center", md: "center" },
        gap: { xs: 1.5, },
        boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
      }}
    >

      <Box sx={{ px: 1, fontWeight: 700, fontSize: { xs: 22, sm: 26, md: 32 }, }}>  {/* Typography */}
        QTD Revenue: ${data.currentQuarterRevenue.toLocaleString()}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", height: 24, display: { xs: "none", md: "block" }, alignSelf: 'center' }} />

      <Box sx={{ px: 1, fontWeight: 700, fontSize: { xs: 18, sm: 20, md: 26 }, opacity: 0.9 }}>
        Target: <span style={{ fontWeight: 600 }}>${data.target.toLocaleString()}</span>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", height: 24, display: { xs: "none", md: "block" }, alignSelf: 'center' }} />

      <Box sx={{ px: 1, fontWeight: 700, fontSize: { xs: 18, sm: 20, md: 24 }, opacity: 0.8 }}>
        <span style={{ color: data.gap < 0 ? "#ff9999" : "#4caf50", fontWeight: 700 }}>
          {data.gapPercentage > 0 ? `+${data.gapPercentage.toFixed(2)}` : data.gapPercentage.toFixed(2)}%
        </span>{" "} 
        to Goal
      </Box>
    </Box>
  );
}