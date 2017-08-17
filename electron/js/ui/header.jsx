import React from "react"
import createStyledElement from "create-styled-element"

const Wrapper = props => {
  const styles = {
    background: "linear-gradient(135deg, #47494f, #2b303b)",
    color: "#ffffff",
    margin: "0",
    padding: "32px",
    position: "fixed",
    width: "calc(100vw - 64px)",
    zIndex: "100",
  }
  return createStyledElement("div", props)(styles)
}
const Header = props => {
  const styles = {
    fontSize: "22px",
    fontWeight: "200",
    lineHeight: "24px",
    overflow: "hidden",
    position: "relative",
    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
    ":after": {
      borderTop: "1px solid #4e91b5",
      content: "''",
      display: "inline-block",
      marginLeft: "16px",
      marginRight: "16px",
      position: "absolute",
      top: "50%",
      width: "100%",
    },
  }
  return <Wrapper>{createStyledElement("h1", props)(styles)}</Wrapper>
}

export default Header
