import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"

const Input = ({ stacked, ...props }) => {
  const styles = {
    flex: "2",
    fontSize: "14px",
    lineHeight: "16px",
  }
  const dynamic = {
    ...(stacked && {
      background: "#eee",
      border: "none",
      borderRadius: "4px",
      padding: "8px",
      "&::placeholder": { color: "#bbb" },
    }),
  }
  return createStyledElement("input", props)(styles, dynamic)
}

const Label = ({ stacked, ...props }) => {
  const styles = {
    flex: "1",
    fontSize: "14px",
    lineHeight: "16px",
  }
  const dynamic = {
    ...(stacked && {
      color: "#979797",
      fontSize: "12px",
      marginBottom: "8px",
      textTransform: "uppercase",
    }),
  }
  return createStyledElement("label", props)(styles, dynamic)
}

const Wrapper = ({ stacked, ...props }) => {
  const styles = {
    display: "flex",
    ":last-child": { margin: "0" },
  }
  const dynamic = {
    margin: "0 0 32px",
    ...(stacked && {
      flexDirection: "column",
      margin: "0 0 16px",
    }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

const LabelInput = ({ children, stacked, name, ...props }) => {
  return (
    <Wrapper stacked={stacked}>
      <Label stacked={stacked} htmlFor={name}>{children || name}</Label>
      <Input stacked={stacked} {...props} name={name} />
    </Wrapper>
  )
}

export default LabelInput
