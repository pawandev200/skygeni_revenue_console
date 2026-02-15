import { Paper, Divider, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Recommendation } from "../types";

interface Props {
  recommendations: Recommendation[];
}

// export default function RecommendationPanel({ recommendations }: Props) {
//   return (
//     <Paper 
//       elevation={0} 
//       sx={{ 
//         p: 3, 
//         borderRadius: "8px", 
//         border: "1px solid #e0e4ec",
//       }}
//     >
//       <Box sx={{ 
//         fontSize: "20px",
//         fontWeight: 800, 
//         color: "#1a2b4b", 
//         mb: 2,
//       }}>
//         Recommended Actions
//       </Box>

//       <Divider sx={{ borderColor: "#f0f2f5", mb: 1 }} />

//       {/* Recommendations List */}
//       <Box>
//         {recommendations.map((rec, index) => (
//           <Box key={index}>
//             <div style={{ 
//               display: "flex", 
//               alignItems: "center", 
//               padding: "16px 0",
//               gap: "12px"
//             }}>

//               <CheckCircleIcon sx={{ color: "#ed8936", fontSize: "20px" }} />
              
//               {/* Recommendation Text */}
//               <span style={{ 
//                 fontSize: "18px",
//                 fontWeight: 500, 
//                 color: "#2d3748",
//               }}>
//                 {rec.title}
//               </span>
//             </div>
            
//             {/* Divider between items, but not after the last one */}
//             {index !== recommendations.length - 1 && (
//               <Divider sx={{ borderColor: "#f0f2f5" }} />
//             )}
//           </Box>
//         ))}
//       </Box>
//     </Paper>
//   );
// }

export default function RecommendationPanel({ recommendations }: Props) {

  return (
    <Paper
      elevation={0}
      sx={{
        pt: 3,
        px: 3,
        borderRadius: "8px",
        border: "1px solid #e0e4ec",
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
        Recommended Actions
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: -1 }} />

      <Box>
        {recommendations.map((rec, index) => (
          <Box key={rec.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                padding: "16px 0",
                gap: "12px",
              }}
            >
              <CheckCircleIcon
                sx={{
                  color: rec.priority === "high"
                      ? "#e53e3e"
                      : rec.priority === "medium"
                      ? "#ed8936"
                      : "#38a169",
                  fontSize: "20px",
                  mt: "4px",
                }}
              />

              <Box>
                <Box
                  sx={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#2d3748",
                  }}
                >
                  {rec.title}
                </Box>

                <Box
                  sx={{
                    fontSize: "14px",
                    color: "#4a5568",
                    mt: 0.5,
                  }}
                >
                  {rec.description}
                </Box>

                {/* <Box
                  sx={{
                    fontSize: "13px",
                    color: "#718096",
                    mt: 0.5,
                  }}
                >
                  {rec.impact}
                </Box> */}

                {/* <Box
                  sx={{
                    fontSize: "13px",
                    color: "#2b6cb0",
                    mt: 0.5,
                  }}
                >
                  {rec.action}
                </Box> */}
              </Box>
            </Box>

            {index !== recommendations.length - 1 && (
              <Divider sx={{ my: -1, borderColor: "#f0f2f5" }} />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
