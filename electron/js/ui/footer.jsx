import React from "react"
import createStyledElement from "create-styled-element"

const Footer = props => {
  const styles = {
    background: "#fafafa",
    borderTop: "1px solid #d7d7d7",
    color: "#aaa",
    fontSize: "10px",
    fontStyle: "italic",
    lineHeight: "16px",
    padding: "7px 8px 8px",
    position: "fixed",
    textAlign: "right",
    bottom: "0",
    width: "calc(100% - 16px)",
  }
  return createStyledElement("div", props)(styles)
}

export default Footer
