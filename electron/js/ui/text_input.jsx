import React from "react"
import createStyledElement from "create-styled-element"

const Input = props => {
  const styles = {
    background: "#eee",
    border: "1px solid #d7d7d7",
    borderRadius: "4px",
    padding: "7px",
    flex: "2",
    fontSize: "14px",
    lineHeight: "16px",
    ":focus": {
      borderColor: "#4e91b5",
      boxShadow: "none",
      outlineStyle: "none",
    },
    "&::placeholder": { color: "#bbb" },
  }
  return createStyledElement("input", props)(styles)
}

const Label = ({ stacked, ...props }) => {
  const styles = {
    color: "#979797",
    fontSize: "12px",
    marginBottom: "8px",
    textTransform: "uppercase",
    flex: "1",
    lineHeight: "16px",
  }
  return createStyledElement("label", props)(styles)
}

const Wrapper = ({ stacked, ...props }) => {
  const styles = {
    flexDirection: "column",
    margin: "0 0 16px",
    display: "flex",
    ":last-child": { margin: "0" },
  }
  return createStyledElement("div", props)(styles)
}

const TextInput = ({ children, name, ...props }) => {
  return (
    <Wrapper>
      <Label htmlFor={name}>{children || name}</Label>
      <Input {...props} name={name} />
    </Wrapper>
  )
}

export default TextInput
