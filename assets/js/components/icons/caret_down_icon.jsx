import React from "react"
import createStyledElement from "create-styled-element"

const Wrapper = ({ size, ...props }) => {
  const styles = {
    alignSelf: "center",
    display: "inline-flex",
    height: "1em",
    position: "relative",
    width: "1em",
    "& svg": {
      bottom: "-0.125em",
      height: "1em",
      width: "1em",
      position: "absolute",
    },
  }
  return createStyledElement("div", props)(styles)
}

const CaretDownIcon = ({ color, ...props }) => {
  return (
    <Wrapper {...props}>
      <svg fill={color} width="1em" height="1em" viewBox="0 0 1792 1792">
        <path d="M1408 704q0 26-19 45l-448 448q-19 19-45 19t-45-19l-448-448q-19-19-19-45t19-45 45-19h896q26 0 45 19t19 45z" />
      </svg>
    </Wrapper>
  )
}

export default CaretDownIcon
