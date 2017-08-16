import React from "react"
import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"
import CaretDownIcon from "../icons/caret_down_icon"

const Link = ({ level, selected, ...props }) => {
  const styles = {
    borderBottom: "1px solid #f3f3f3",
    display: "flex",
    "&:hover": {
      background: "#fafafa",
      color: "#4e91b5",
      cursor: "pointer",
    },
  }
  const dynamic = {
    background: "#ffffff",
    fontSize: "12px",
    lineHeight: "16px",
    padding: "8px 8px 7px",
    ...(level && {
      padding: `8px 8px 7px ${8 + 8 * level}px`,
      ...(level === 1 && {
        fontSize: "16px",
        fontWeight: "700",
        lineHeight: "24px",
      }),
    }),
    ...(selected && {
      background: "#f7f7f7",
      boxShadow: "inset 4px 0 #4e91b5",
      color: "#4e91b5",
    }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

const Name = props => {
  const styles = { flex: "1" }
  return createStyledElement("div", props)(styles)
}

const CaretToggle = ({ expanded, ...props }) => {
  const styles = {
    transition: "transform .1s ease-in-out",
  }
  const dynamic = {
    transform: "rotate(90deg)",
    ...(expanded && { transform: "rotate(0deg)" }),
  }
  return createStyledElement(CaretDownIcon, props)(styles, dynamic)
}

const NavLink = ({ children, level, selected, ...props }) => {
  return (
    <Link {...props} level={level} selected={selected}>
      <Name>{children}</Name>
      {level === 1 && <CaretToggle color="#aaaaaa" expanded={selected} />}
    </Link>
  )
}

NavLink.propTypes = {
  link: PropTypes.bool,
  selected: PropTypes.bool,
}

export default NavLink
