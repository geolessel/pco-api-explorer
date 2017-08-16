import React from "react"
import createStyledElement from "create-styled-element"

const OptionsLabel = props => {
  const styles = { display: "block" }
  return createStyledElement("label", props)(styles)
}

export default OptionsLabel
