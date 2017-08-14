import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"
import CaretDownIcon from "../icons/caret_down_icon"

const Link = ({ level, selected, ...props }) => {
  const styles = {
    fontSize: "12px",
    lineHeight: "16px",
    position: "relative",
    "&:hover": {
      background: "#fafafa",
      color: "#4e91b5",
      cursor: "pointer"
    }
  }
  const dynamic = {
    padding: "8px 16px",
    ...(level && {
      padding: `8px 16px 8px ${24 + 8 * level}px`,
      ...(level === 1 && { fontWeight: "700" })
    }),
    ...(selected && {
      background: "#f7f7f7",
      boxShadow: "inset 2px 0 #4e91b5",
      color: "#4e91b5"
    })
  }
  return createStyledElement("div", props)(styles, dynamic)
}

const CaretToggle = ({ expanded, ...props }) => {
  const styles = {
    position: "absolute",
    left: "8px"
  }
  const dynamic = {
    transform: "rotate(-90deg)"
  }
  return createStyledElement(CaretDownIcon, props)(styles, dynamic)
}

const NavLink = ({ children, level, ...props }) => {
  return (
    <Link {...props} level={level}>
      {level === 1 && <CaretToggle color="#aaaaaa" />}
      <span>{children}</span>
    </Link>
  )
}

NavLink.propTypes = {
  link: PropTypes.bool,
  selected: PropTypes.bool
}

export default NavLink
