import React from "react"
import createStyledElement from "create-styled-element"

const Pane = props => {
  const styles = {
    border: "1px solid #eeeeee",
    borderRadius: "3px",
    background: "#ffffff",
    marginBottom: "16px",
    padding: "15px",
    ":last-child": { marginBottom: "0" },
  }
  return createStyledElement("div", props)(styles)
}

export default Pane
