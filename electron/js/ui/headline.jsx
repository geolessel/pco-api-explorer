import React from "react"
import createStyledElement from "create-styled-element"

const Headline = ({ tag, ...props }) => {
  const styles = { margin: "0 0 16px" }
  const dynamic = {
    color: "#333333",
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "200",
    ...(tag === "h2" && {
      color: "#646464",
      fontSize: "14px",
      fontWeight: "700",
      lineHeight: "16px",
    }),
  }
  return createStyledElement(tag || "h1", props)(styles, dynamic)
}

export default Headline
