import React from "react"
import createStyledElement from "create-styled-element"

const Button = props => {
  const styles = {
    background: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "22px",
    padding: "0 6px",
    userSelect: "none",
    ":hover": { background: "#f7f7f7" },
    ":active": { borderColor: "#aaa" },
  }
  return createStyledElement("div", props)(styles)
}

export default Button
