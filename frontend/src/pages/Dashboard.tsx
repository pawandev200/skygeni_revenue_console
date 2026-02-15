import { Box, CircularProgress, Paper } from "@mui/material";
import QtdHeader from "../components/QtdHeader";
import RevenueDrivers from "../components/RevenueDrivers";
import RiskPanel from "../components/RiskPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import RevenueTrendChart from "../components/charts/RevenueTrendChart";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const {
    summary,
    drivers,
    risks,
    recommendations,
    trend,
    loading,
  } = useDashboard();

  if (loading) return <CircularProgress />;

  // console.log("Recommendations:", recommendations);

  return (
    <Box sx={{ px: 4, py: 3, minHeight: "100vh" }}>
      {summary && <QtdHeader data={summary} />}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr 1fr",
          },
          gridTemplateRows: "auto auto",
          gap: 2,
          mt: 3,
        }}
      >
        {drivers && (
          <Box sx={{ gridRow: { md: "1 / span 2" } }}>
            <RevenueDrivers data={drivers} />
          </Box>
        )}

        {risks && (
          <Box>
            <RiskPanel data={risks} />
          </Box>
        )}

        {recommendations.length > 0 && (
          <Box>
            <RecommendationPanel recommendations={recommendations} />
          </Box>
        )}

        {trend.length > 0 && (
          <Box sx={{ gridColumn: { md: "2 / span 2" } }}>
            <Paper
              elevation={0}
              sx={{
                pt: 3,
                px: 3,
                pb: 2.5,
                borderRadius: "8px",
                border: "1px solid #e0e4ec",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#1a2b4b",
                  }}
                >
                  Revenue Trend
                </Box>

                <Box
                  sx={{
                    fontSize: { xs: 16, md: 18 },
                    fontWeight: 600,
                    color: "#6b7280",
                  }}
                >
                  (Last 6 Months)
                </Box>
              </Box>

              <RevenueTrendChart data={trend} />
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}
