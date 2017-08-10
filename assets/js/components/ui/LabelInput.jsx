import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"

const Input = props => {
  const styles = {
    flex: "2",
    fontSize: "14px",
    lineHeight: "16px",
  }
  return createStyledElement("input", props)(styles)
}

const Label = props => {
  const styles = {
    flex: "1",
    fontSize: "14px",
    lineHeight: "16px",
  }
  return createStyledElement("label", props)(styles)
}

const Wrapper = props => {
  const styles = {
    display: "flex",
    margin: "0 0 16px",
    ":last-child": {
      margin: "0",
    },
  }
  return createStyledElement("div", props)(styles)
}

const LabelInput = ({ children, name, ...props }) => {
  return (
    <Wrapper>
      <Label htmlFor={name}>{children || name}</Label>
      <Input {...props} name={name} />
    </Wrapper>
  )
}

export default LabelInput
