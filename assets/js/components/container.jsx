import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"
import createStyledElement from "create-styled-element"
import ListItem from "./ui/list_item"
import NavLink from "./ui/nav_link"
import LabelInput from "./ui/label_input"

const base64 = require("base-64")
const defaultPerPage = 25
const defaultPage = 1
const defaultParams = { per_page: defaultPerPage, page: defaultPage }

const Headline = props => {
  const styles = {
    color: "#333333",
    fontSize: "18px",
    lineHeight: "24px",
    margin: "0 0 24px",
  }
  return createStyledElement("h1", props)(styles)
}

const OptionsLabel = props => {
  const styles = { display: "block" }
  return createStyledElement("label", props)(styles)
}

const Pane = props => {
  const styles = {
    border: "1px solid #eeeeee",
    borderRadius: "3px",
    background: "#ffffff",
    marginBottom: "16px",
    padding: "15px",
    ":last-child": { marginBottom: "0" },
  }
  return createStyledElement("div", props)(styles)
}

class API {
  static get(url, callback) {
    console.log("getting url", url)
    fetch(url, {
      headers: new Headers({
        Authorization: `Basic ${API.key}`,
      }),
    })
      .then(resp => resp.json())
      .then(resp => callback(resp))
  }
}

class Node {
  constructor({ name, self, children, path }) {
    this.name = name
    this.self = self
    this.children = children
    this.path = path
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.apiRoot = `http://api.pco.dev`
    const startingUrl = `${this.apiRoot}/people/v2`
    const startingApp = "people"
    const startingVersion = 2

    this.state = {
      app: startingApp,
      version: startingVersion,
      tree: { children: [] },
      baseUrl: `${this.apiRoot}/${startingApp}/v${startingVersion}`,
      links: [],
      response: {},
      current: startingUrl,
      params: { per_page: defaultPerPage, page: defaultPage },
    }

    API.key = base64.encode(`${this.props.applicationId}:${this.props.secret}`)

    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleOrderingChange = this.handleOrderingChange.bind(this)
    this.handleQueryingChange = this.handleQueryingChange.bind(this)
    this.handleIncludingChange = this.handleIncludingChange.bind(this)
    this.handleFilteringChange = this.handleFilteringChange.bind(this)
    this.handleLimitingChange = this.handleLimitingChange.bind(this)
    this.currentURLWithExtraParams = this.currentURLWithExtraParams.bind(this)
    this.updateParams = this.updateParams.bind(this)
    this.createChildren = this.createChildren.bind(this)
    this.findNodeBySelf = this.findNodeBySelf.bind(this)
    this.baseUrl = this.baseUrl.bind(this)
    this.computePath = this.computePath.bind(this)
  }

  createChildren({ response }) {
    const { data } = response
    if (data.links) {
      return Object.keys(data.links).map(k => {
        return new Node({
          name: k,
          self: data.links[k],
          children: [],
          path: this.computePath(data.links[k]),
        })
      })
    } else if (Array.isArray(data)) {
      return data.map(
        d =>
          new Node({
            name: d.type,
            self: d.links.self,
            children: [],
            path: this.computePath(d.links.self),
          })
      )
    }
  }

  componentDidMount() {
    API.get(this.state.current, response => {
      const node = new Node({
        name: "people",
        self: response.data.links.self,
        children: this.createChildren({ response }),
        path: this.computePath(response.data.links.self),
      })

      this.setState({
        response: response,
        links: response.data.links,
        tree: node,
      })
    })
  }

  render() {
    const { current, response, tree } = this.state
    const { Div, Input } = createStyledElement

    return (
      <Div css={{ display: "flex" }}>
        <Div
          css={{
            borderLeft: "1px solid #eeeeee",
            flexBasis: "200px",
            padding: "32px 0 0",
          }}
        >
          <Headline>API Tree</Headline>
          <Tree
            children={tree.children}
            onClick={this.handleLinkClick}
            key={tree.self}
            current={this.state.current}
            topLevelParent
          />
        </Div>
        <Div
          css={{
            background: "#f7f7f7",
            flex: "1",
            padding: "32px",
          }}
        >
          <Div
            css={{
              background: "#fafafa",
              border: "1px solid #eeeeee",
              borderRadius: "3px",
              padding: "15px",
            }}
          >
            <Headline css={{ display: "flex", margin: "0" }}>
              <span>Current Link</span>
              <Input
                css={{
                  color: "#979797",
                  flex: "1",
                  fontSize: "14px",
                  lineHeight: "16px",
                  margin: "-2px 0 -2px 8px",
                  padding: "4px",
                }}
                readOnly={true}
                type="text"
                value={current}
              />
            </Headline>
          </Div>
          <Div css={{ display: "flex", flex: "1" }}>
            <Div
              css={{
                flex: "1",
                margin: "16px 32px 0 0",
                minWidth: "0",
                overflow: "hidden",
                textOverflow: "ellipses",
                whiteSpace: "nowrap",
              }}
            >
              <Ordering {...this.state} onChange={this.handleOrderingChange} />
              <Querying
                {...this.state}
                onChange={e => this.handleQueryingChange(e)}
              />
              <Including
                {...this.state}
                onChange={e => this.handleIncludingChange(e)}
              />
              <Filtering
                {...this.state}
                onChange={e => this.handleFilteringChange(e)}
              />
              <Limiting
                {...this.state}
                onChange={e => this.handleLimitingChange(e)}
              />
            </Div>
            <Div css={{ flex: "1", minWidth: "0" }}>
              <h3>Server Response</h3>
              <ReactJsonView
                src={response}
                collapsed={1}
                displayDataTypes={false}
              />
            </Div>
          </Div>
        </Div>
      </Div>
    )
  }

  handleLinkClick(current) {
    console.log("click", current)
    this.setState({ current })
    this.updateParams(defaultParams)
  }

  handleOrderingChange(e) {
    const value = e.target.value
    let params = this.state.params

    if (value === "none") {
      delete params.order
    } else {
      params = Object.assign(params, { order: value })
    }

    this.updateParams(params)
  }

  handleQueryingChange(e) {
    const { name, value } = e.target
    const key = `where[${name}]`
    let params = this.state.params

    if (value === "") {
      delete params[key]
    } else {
      params = Object.assign(params, { [key]: value })
    }

    this.updateParams(params)
  }

  handleIncludingChange(e) {
    const { name, checked } = e.target
    let params = this.state.params
    let included = params.include || []

    if (checked) {
      included.push(name)
    } else {
      included = included.filter(i => i !== name)
    }

    params = Object.assign(params, {
      include: included,
    })

    this.updateParams(params)
  }

  handleFilteringChange(e) {
    const { name, checked } = e.target
    let params = this.state.params
    let filtered = params.filter || []

    if (checked) {
      filtered.push(name)
    } else {
      filtered = filtered.filter(i => i !== name)
    }

    params = Object.assign(params, {
      filter: filtered,
    })

    this.updateParams(params)
  }

  handleLimitingChange(e) {
    const { name, value } = e.target
    let params = this.state.params
    params = Object.assign(params, { [name]: value })
    this.updateParams(params)
  }

  findNodeBySelf(link) {
    return this.state.tree.children.find(n => n.self === link)
  }

  updateParams(params) {
    this.setState({ params }, () => {
      const current = this.currentURLWithExtraParams()
      API.get(current, response => {
        // TODO use underscore or something for this deep merge? Sheesh.
        let parent = this.findNodeBySelf(current)
        let tree = this.state.tree
        if (parent) {
          parent.children = this.createChildren({ response })
          const index = tree.children.indexOf(parent)
          const child = Object.assign(tree.children[index], parent)
          const children = Object.assign(tree.children, children)
          tree = Object.assign(tree, children)
        }
        this.setState({ current, response, tree })
      })
    })
  }

  currentURLWithExtraParams(extraParams = {}) {
    const base = this.baseUrl()
    let params = Object.assign(this.state.params, extraParams)
    if (params.per_page == defaultPerPage) {
      delete params.per_page
    }
    if (params.page == defaultPage) {
      delete params.page
    }
    params = Object.keys(params).map(k => `${k}=${params[k]}`).join("&")
    if (Object.keys(params).length > 0) {
      return `${base}?${params}`
    } else {
      return base
    }
  }

  baseUrl() {
    return this.state.current.split("?")[0]
  }

  computePath(link) {
    let path = link
      .replace(this.state.baseUrl, "")
      .replace(/\/\d+(\/)*/g, "/:id$1")
      .split("/")
    path.shift()
    return path
  }
}

const Tree = ({ children, current, topLevelParent, onClick, style }) => {
  const tree = children.map(l => {
    let children
    if (l.children.length > 0) {
      children = (
        <Tree children={l.children} onClick={onClick} topLevelParent={false} />
      )
    }

    const { Div } = createStyledElement

    return (
      <div>
        <NavLink
          link
          url={l.self}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onClick(l.self)
          }}
          key={l.self}
          selected={current === l.self}
          topLevelParent={topLevelParent}
        >
          {l.name}
        </NavLink>
        {children}
      </div>
    )
  })

  return (
    <div>
      {tree}
    </div>
  )
}

const Ordering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_order_by) {
    const options = response.meta.can_order_by.map(o =>
      <OptionsLabel key={o}>
        <input type="radio" name="orderBy" value={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    )

    return (
      <Pane>
        <Headline>Ordering</Headline>
        <div>
          <OptionsLabel key={"none"}>
            <input
              type="radio"
              name="orderBy"
              onChange={onChange}
              value="none"
              checked={params.order == undefined}
            />
            None
          </OptionsLabel>
          {options}
        </div>
      </Pane>
    )
  } else {
    return null
  }
}

const Querying = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_query_by) {
    const options = response.meta.can_query_by.map(o =>
      <LabelInput key={o} name={o} type="text" onChange={onChange} />
    )

    return (
      <Pane>
        <Headline>Querying</Headline>
        {options}
      </Pane>
    )
  } else {
    return null
  }
}

const Including = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_include) {
    const options = response.meta.can_include.map(o =>
      <OptionsLabel key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    )

    return (
      <Pane>
        <Headline>Including</Headline>
        <div>
          {options}
        </div>
      </Pane>
    )
  } else {
    return null
  }
}

const Filtering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_filter) {
    const options = response.meta.can_filter.map(o =>
      <OptionsLabel key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    )

    return (
      <Pane>
        <Headline>Filtering</Headline>
        <div>
          {options}
        </div>
      </Pane>
    )
  } else {
    return null
  }
}

const Limiting = ({ response, onChange, params }) => {
  return (
    <Pane>
      <Headline>Limiting</Headline>
      <LabelInput
        onChange={onChange}
        name="page"
        type="text"
        value={params.page}
      >
        Page:
      </LabelInput>
      <LabelInput
        onChange={onChange}
        name="per_page"
        type="text"
        value={params.per_page}
      >
        Per page:
      </LabelInput>
    </Pane>
  )
}

const CurrentLink = ({ current }) => {
  return (
    <Div css={{ background: "#fafafa", padding: "4px" }}>
      <Headline css={{ display: "flex", margin: "0" }}>
        <span>Current Link</span>
        <input
          style={{
            color: "#979797",
            flex: "1",
            fontSize: "14px",
            lineHeight: "16px",
            marginLeft: "8px",
            padding: "4px",
          }}
          readOnly={true}
          type="text"
          value={current}
        />
      </Headline>
    </Div>
  )
}

export default Container
