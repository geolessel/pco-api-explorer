import React from "react"
import createStyledElement from "create-styled-element"

const Pane = ({ theme, ...props }) => {
  const styles = {
    border: "1px solid #eeeeee",
    borderRadius: "4px",
    marginBottom: "16px",
    padding: "15px",
    ":last-child": { marginBottom: "0" },
  }
  const dynamic = {
    background: "#ffffff",
    ...(theme === "dark" && {
      background: "#2b303b",
    }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

export default Pane
