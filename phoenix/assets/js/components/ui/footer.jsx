import React from "react"
import createStyledElement from "create-styled-element"

const Footer = props => {
  const styles = {
    background: "#fafafa",
    borderTop: "1px solid #eee",
    color: "#aaa",
    fontSize: "10px",
    fontStyle: "italic",
    lineHeight: "16px",
    padding: "8px",
    textAlign: "right",
  }
  return createStyledElement("div", props)(styles)
}

export default Footer
