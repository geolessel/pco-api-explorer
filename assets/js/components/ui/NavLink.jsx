import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"

const NavLink = ({ selected, topLevelParent, ...props }) => {
  const styles = {
    fontSize: "12px",
    lineHeight: "16px",
    "&:hover": {
      background: "#fafafa",
      color: "#4e91b5",
      cursor: "pointer",
    },
  }
  const dynamic = {
    padding: "8px 32px",
    ...(selected && {
      background: "#f7f7f7",
      boxShadow: "inset 2px 0 #4e91b5",
      color: "#4e91b5",
    }),
    ...(topLevelParent && {
      borderRight: "none",
      fontWeight: "700",
      padding: "8px 16px",
    }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

NavLink.propTypes = {
  link: PropTypes.bool,
  selected: PropTypes.bool,
}

export default NavLink
