import React from "react"
import createStyledElement from "create-styled-element"

const Button = ({ size, theme, ...props }) => {
  const styles = {
    borderRadius: "4px",
    cursor: "pointer",
    padding: "0 6px",
    userSelect: "none",
  }
  const dynamic = {
    background: "#ffffff",
    border: "1px solid #ddd",
    fontSize: "12px",
    lineHeight: "22px",
    ":hover": { background: "#f7f7f7" },
    ":active": { borderColor: "#aaa" },
    ...(size === "lg" && {
      fontSize: "14px",
      lineHeight: "32px",
      border: "none",
    }),
    ...(theme === "success" && {
      background: "#92bb6e",
      color: "#ffffff",
      ":hover": { background: "#84a963" },
      ":active": { borderColor: "#92bb6e" },
    }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

export default Button
