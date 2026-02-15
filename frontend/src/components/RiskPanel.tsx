// const risks = [
//   `${data.staleDeals.length} deals stuck over 30 days`,
//   data.underperformingReps.length > 0
//     ? `Rep ${data.underperformingReps[0].repName} – Win Rate: ${(data.underperformingReps[0].winRate * 100).toFixed(1)}%`
//     : `No underperforming reps`,
//   `${data.lowActivityAccounts.length} deals with no recent activity`,
// ];

import { Paper, Divider, Box } from "@mui/material";
import type { RiskFactors } from "../types";

interface Props {
  data: RiskFactors;
}

export default function RiskPanel({ data }: Props) {

  const topUnderperformer = data.underperformingReps.length > 0 ? data.underperformingReps[0] : null;

  const risks = [
    `${data.staleDeals.length} Enterprise deals stuck over 30 days`,
    topUnderperformer
      ? `Rep ${topUnderperformer.repName} – Win Rate: ${topUnderperformer.winRate.toFixed(1)}%`
      : `No underperforming reps`,
    `${data.lowActivityAccounts.length} Accounts with no recent activity`,
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        pt: 3,
        px: 3,
        pb: 4,
        borderRadius: "8px",
        border: "1px solid #e0e4ec",
        width: "100%",
      }}
    >
      <Box
        sx={{
          fontSize: "20px",
          fontWeight: 800,
          color: "#1a2b4b",
          mb: 2,
        }}
      >
        Top Risk Factors
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1 }} />

      {risks.map((text, index) => (
        <Box key={index}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "14px 0",
              gap: "12px",
            }}
          >
            <Box
              sx={{
                width: "10px",
                height: "10px",
                backgroundColor: "#ed8936",
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />

            <Box
              sx={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#2d3748",
              }}
            >
              {text}
            </Box>
          </Box>

          {index !== risks.length - 1 && (
            <Divider sx={{ borderColor: "#f0f2f5" }} />
          )}
        </Box>
      ))}
    </Paper>
  );
}
