import React from "react"
import createStyledElement from "create-styled-element"

const Wrapper = ({ size, ...props }) => {
  const styles = { display: "inline-block", verticalAlign: "-4px" }
  const dynamic = {
    height: "16px",
    width: "16px",
    ...(size && { height: `${size}px`, width: `${size}px` }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

const CaretDownIcon = ({ color, size, ...props }) => {
  return (
    <Wrapper {...props} size={size}>
      <svg
        fill={color}
        width={size || "16"}
        height={size || "16"}
        viewBox="0 0 1792 1792"
      >
        <path d="M1408 704q0 26-19 45l-448 448q-19 19-45 19t-45-19l-448-448q-19-19-19-45t19-45 45-19h896q26 0 45 19t19 45z" />
      </svg>
    </Wrapper>
  )
}

export default CaretDownIcon
