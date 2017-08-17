import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"

const Input = ({ stacked, ...props }) => {
  const styles = { fontSize: "14px", lineHeight: "16px", margin: "0 8px" }
  return createStyledElement("input", props)(styles)
}

const Label = ({ selected, ...props }) => {
  const styles = {
    borderRadius: "4px",
    cursor: "pointer",
    display: "block",
    flex: "1",
    fontSize: "14px",
    lineHeight: "16px",
    marginBottom: "4px",
    padding: "8px 4px",
    ":last-child": { marginBottom: "0px" },
  }
  const dynamic = {
    ":hover": { background: "#fafafa" },
    ...(selected && {
      background: "#f7f7f7",
      ":hover": { background: "#f7f7f7" },
    }),
  }
  return createStyledElement("label", props)(styles, dynamic)
}

const Text = ({ stacked, ...props }) => {
  const styles = {
    fontSize: "14px",
    lineHeight: "16px",
    userSelect: "none",
  }
  return createStyledElement("span", props)(styles)
}

const FormInput = ({ children, selected, ...props }) => {
  return (
    <Label key={props.name} htmlFor={props.id} selected={selected}>
      <Input {...props} />
      <Text>{children}</Text>
    </Label>
  )
}

export default FormInput
