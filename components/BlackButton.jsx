// src/components/BlackButton.jsx
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const BlackButton = styled(Button)({
  backgroundColor: "black",
  color: "white",
  "&:hover": {
    backgroundColor: "#333",
  },
});

export default BlackButton;
