import { Paper, Typography, Box, Divider } from "@mui/material";
import type { RevenueDrivers } from "../types";
import SparklineChart from "./charts/SparklineChart";

interface Props {
  data: RevenueDrivers;
}

export default function RevenueDrivers({ data }: Props) {
  // {console.log("Metric:", data)}
  return (
    <Paper 
    elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: "8px", 
        border: "1px solid #e0e4ec",
      }}
    >

      <Box sx={{ 
        fontSize: "20px",
        fontWeight: 800, 
        color: "#1a2b4b", 
        mb: 2,
      }}>
        Revenue Drivers
      </Box>
      <Divider sx={{ borderColor: "#f0f2f5", mb: 2 }} />

      <Metric
        label="Pipeline Value"
        metric={data.pipelineSize}
        format={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
        color="#3b82f6"
        type="area"
      />

      <Divider sx={{ my: 2 }} />
      
      <Metric
        label="Win Rate"
        metric={data.winRate}
        format={(v) => `${(v).toFixed(1)}%`}  // v * 100, backend is already sending percentage
        color="#2563eb"
        type="bar"
      />

      <Divider sx={{ my: 2 }} />

      <Metric
        label="Avg Deal Size"
        metric={data.averageDealSize}
        format={(v) => `$${(v / 1000).toFixed(1)}K`}
        color="#3b82f6"
        type="area"
      />

      <Divider sx={{ my: 2 }} />

      <Metric
        label="Sales Cycle"
        metric={data.salesCycleTime}
        format={(v) => `${v.toFixed(0)} Days`}
        color="#f59e0b"
        type="area"
        isShowDays={true}
      />
    </Paper>
  );
}

function Metric({
  label,
  metric,
  format,
  color,
  type,
  isShowDays = false,
}: {
  label: string;
  metric: {
    value: number;
    change: number;
    changePercentage: number;
    trend: number[];
    
  };
  format: (v: number) => string;
  color: string;
  type: "area" | "bar";
  isShowDays?: boolean;
}) {
  const isPositive = metric.changePercentage >= 0;

  return (
    <Box sx={{ mt: 1 }}>
      {/* Top Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={600}>{label}</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {format(metric.value)}
          </Typography>

          <Typography
            sx={{
              color: isPositive ? "#16a34a" : "#dc2626",
              fontWeight: 700,
            }}
          >
            {isPositive ? "+" : ""}
            {isShowDays ? `${metric.change} Days` : `${metric.changePercentage.toFixed(1)}%`}
          </Typography>
        </Box>
      </Box>

      {/* Mini Graph */}
      <Box 
       sx={{
        mt: 1,
        px: 1,
        pt: 1,
        border: "1px solid #e5e7eb",
        borderRadius: 1,
        backgroundColor: "#f9fafb",
      }}
      >
        <SparklineChart
          data={metric.trend}
          color={color}
          type={type}
        />
      </Box>
    </Box>
  );
}
