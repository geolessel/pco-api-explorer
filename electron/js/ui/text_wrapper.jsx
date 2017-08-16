import React from "react"
import createStyledElement from "create-styled-element"

const TextWrapper = ({ transparent, ...props }) => {
  const styles = {
    color: "#999999",
    margin: "0 8px 0 16px",
    padding: "0 8px",
    minWidth: "0",
    wordWrap: "break-word",
  }
  const dynamic = {
    background: "#ffffff",
    ...(transparent && { background: "none" }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

export default TextWrapper
