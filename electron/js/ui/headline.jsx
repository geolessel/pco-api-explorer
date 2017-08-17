import React from "react"
import createStyledElement from "create-styled-element"

const Headline = props => {
  const styles = {
    color: "#333333",
    fontSize: "18px",
    lineHeight: "24px",
    margin: "0 0 16px",
  }
  return createStyledElement("h1", props)(styles)
}

export default Headline
