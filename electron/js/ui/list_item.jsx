import PropTypes from "prop-types"
import createStyledElement from "create-styled-element"

const ListItem = ({ link, selected, topLevelParent, ...props }) => {
  const styles = {
    borderBottom: "1px solid #eeeeee",
    borderLeft: "1px solid #eeeeee",
    fontSize: "12px",
    lineHeight: "24px",
    padding: "4px 8px 3px",
    ":first-child": {
      borderTop: "1px solid #eeeeee",
      lineHeight: "24px",
      padding: "3px 8px 3px",
    },
  }
  const dynamic = {
    borderRight: "1px solid #eeeeee",
    ...(link && { "&:hover": { background: "#fafafa", cursor: "pointer" } }),
    ...(selected && { background: "#f7f7f7" }),
    ...(topLevelParent && { borderRight: "none" }),
  }
  return createStyledElement("div", props)(styles, dynamic)
}

ListItem.propTypes = {
  link: PropTypes.bool,
  selected: PropTypes.bool,
}

export default ListItem
