import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"
import createStyledElement from "create-styled-element"
import _ from "underscore"
import ReactLoading from "react-loading" // https://github.com/fakiolinho/react-loading
import ListItem from "./ui/list_item"
import NavLink from "./ui/nav_link"
import LabelInput from "./ui/label_input"
import Headline from "./ui/headline"
import OptionsLabel from "./ui/options_label"
import Pane from "./ui/pane"

const base64 = require("base-64")
const defaultPerPage = 25
const defaultOffset = 0
const defaultParams = { per_page: defaultPerPage, offset: defaultOffset }

const log = true
// const log = false
const console = {
  groupCollapsed(name) {
    if (log) {
      window.console.groupCollapsed(name)
    }
  },

  groupEnd() {
    if (log) {
      window.console.groupEnd()
    }
  },

  log(terms) {
    if (log) {
      window.console.log(terms)
    }
  }
}

class API {
  static get(url, callback) {
    console.groupCollapsed("API.get")
    console.log("getting url", url)
    fetch(url, {
      headers: new Headers({
        Authorization: `Basic ${API.key}`
      })
    })
      .then(resp => resp.json())
      .then(resp => callback(resp))
    console.groupEnd()
  }
}

class Node {
  constructor({ name, self, children, path, childrenIds, id }) {
    this.name = name
    this.self = self
    this.children = children
    this.path = path
    this.id = id
    this.childrenIds = childrenIds
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.apiRoot = `http://api.pco.dev`
    this.apiVersion = "v2"
    const startingTree = [
      new Node({
        name: "check_ins",
        self: `${this.apiRoot}/check_ins/${this.apiVersion}`,
        children: [],
        path: ["check_ins", this.apiVersion]
      }),
      new Node({
        name: "giving",
        self: `${this.apiRoot}/giving/${this.apiVersion}`,
        children: [],
        path: ["giving", this.apiVersion]
      }),
      new Node({
        name: "people",
        self: `${this.apiRoot}/people/${this.apiVersion}`,
        children: [],
        path: ["people", this.apiVersion]
      }),
      new Node({
        name: "services",
        self: `${this.apiRoot}/services/${this.apiVersion}`,
        children: [],
        path: ["services", this.apiVersion]
      })
    ]

    this.state = {
      tree: { children: startingTree },
      baseUrl: `${this.apiRoot}`,
      response: {},
      current: "",
      params: defaultParams,
      isFetching: false
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

  shouldComponentUpdate() {
    return true
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
            padding: "32px 0 0"
          }}
        >
          <Headline>API Tree</Headline>
          <Tree
            children={tree.children}
            onClick={this.handleLinkClick}
            key={tree.self}
            current={this.computePath(current)}
          />
        </Div>
        <Div
          css={{
            background: "#f7f7f7",
            flex: "1",
            padding: "32px"
          }}
        >
          <Div
            css={{
              background: "#fafafa",
              border: "1px solid #eeeeee",
              borderRadius: "3px",
              padding: "15px"
            }}
          >
            <Headline css={{ display: "flex", margin: "0" }}>
              <span>Current URL</span>
              <Input
                css={{
                  color: "#979797",
                  flex: "1",
                  fontSize: "14px",
                  lineHeight: "16px",
                  margin: "-2px 0 -2px 8px",
                  padding: "4px"
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
                margin: "0 32px 0 0",
                minWidth: "0",
                overflow: "hidden",
                textOverflow: "ellipses",
                whiteSpace: "nowrap"
              }}
            >
              <h3>URL Parameters</h3>
              {this.state.isFetching
                ? <ReactLoading type="cylon" color="777" delay={0} />
                : <span>
                    <Ordering
                      {...this.state}
                      onChange={this.handleOrderingChange}
                    />
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
                  </span>}
            </Div>
            <Div css={{ flex: "1", minWidth: "0" }}>
              <h3>Server Response</h3>
              {this.state.isFetching
                ? <ReactLoading type="cylon" color="777" delay={0} />
                : <ReactJsonView
                    src={response}
                    collapsed={1}
                    displayDataTypes={false}
                  />}
            </Div>
          </Div>
        </Div>
      </Div>
    )
  }

  createChildren({ response }) {
    const { data } = response
    const { tree } = this.state
    if (data.links) {
      Object.keys(data.links).map(k => {
        if (k !== "self") {
          const path = this.computePath(data.links[k])
          const name = path.slice(-1).toString() == ":id" ? "<id>" : k
          const parent = this.recursivelyFindByPath(path.slice(0, -1), tree)

          if (parent) {
            parent.children.push(
              new Node({
                self: data.links[k],
                children: [],
                id: Number(data.id),
                name,
                path
              })
            )
          }
        }
      })
    } else if (Array.isArray(data)) {
      data.forEach(d => {
        const path = this.computePath(d.links.self)
        const name = path.slice(-1).toString() == ":id" ? "<id>" : d.type
        const parent = this.recursivelyFindByPath(path.slice(0, -1), tree)

        if (parent) {
          parent.children.push(
            new Node({
              self: d.links.self,
              children: [],
              id: Number(d.id),
              name,
              path
            })
          )
        }
      })
    }
  }

  findParentNode(url) {
    const { tree } = this.state
    const pathOfParent = this.computePath(url)
    console.log("looking for ", pathOfParent.toString())
    let parent
    tree.children.some(c => {
      console.log("checking", c.path.toString())
      if (c.children.length > 0) {
        c.children.some(g => {
          console.log("checking child", g.path.toString())
          if (g.path.toString() == pathOfParent.toString()) {
            parent = g
            return true
          }
        })
      }
      if (c.path.toString() == pathOfParent.toString()) {
        parent = c
        return true
      }
    })
    console.log("parent of ", url, " is ", parent)
    return parent
  }

  handleLinkClick(current) {
    console.groupCollapsed("handleLinkClick")
    console.log("click", current)
    this.setState({ current, params: defaultParams }, () => {
      this.updateParams({})
    })
    console.groupEnd()
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
      include: included
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
      filter: filtered
    })

    this.updateParams(params)
  }

  handleLimitingChange(e) {
    let { name, value } = e.target
    if (name == "offset" && value == "") {
      value = defaultOffset
    }
    if (name == "per_page" && value == "") {
      value = defaultPerPage
    }
    let params = this.state.params
    params = Object.assign(params, { [name]: value })
    this.updateParams(params)
  }

  findNodeBySelf(link) {
    return this.state.tree.children.find(n => n.self === link)
  }

  updateParams(params) {
    this.setState({ params, isFetching: true }, () => {
      const current = this.currentURLWithExtraParams()
      API.get(current, response => {
        console.groupCollapsed("updateParams")
        let tree = this.state.tree
        this.createChildren({ response })
        this.setState({ current, response, tree, isFetching: false })
        console.groupEnd()
      })
    })
  }

  recursivelyFindByPath(pathNeedle, nodeHaystack) {
    console.groupCollapsed("recursivelyFindByPath")
    let match
    console.log("looking for", pathNeedle.toString())
    nodeHaystack.children.some(c => {
      const pathString = c.path.toString()
      console.log("checking", pathString)
      if (pathNeedle.toString() == pathString) {
        match = c
        return true
      } else {
        if (c.children.length > 0) {
          match = this.recursivelyFindByPath(pathNeedle, c)
        }
      }
      return match
    })
    console.groupEnd()
    return match
  }

  currentURLWithExtraParams(extraParams = {}) {
    const base = this.baseUrl()
    let params = Object.assign(this.state.params, extraParams)
    if (params.per_page == defaultPerPage) {
      delete params.per_page
    }
    if (params.offset == defaultOffset) {
      delete params.offset
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
    if (link === null) {
      return []
    }
    let path = link
      .replace(this.state.baseUrl, "")
      .replace(/\/\d+(\/)*/g, "/:id$1")
      .split("/")
    path.shift()
    return path
  }
}

const Tree = ({ children, current, onClick, style }) => {
  const tree = children.map(l => {
    let children
    if (l.children.length > 0) {
      children = (
        <Tree
          key={`${l.path.toString()}-children`}
          children={_.uniq(l.children, false, c => c.name)}
          onClick={onClick}
          current={current}
        />
      )
    }

    const { Div } = createStyledElement

    return (
      <div style={{}}>
        <NavLink
          link
          url={l.self}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onClick(l.self)
          }}
          key={l.path.toString()}
          selected={current.toString() === l.path.toString()}
          level={l.path.length - 1}
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
    const options = response.meta.can_order_by.map(o => (
      <OptionsLabel key={o}>
        <input type="radio" name="orderBy" value={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    ))

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
    const options = response.meta.can_query_by.map(o => (
      <LabelInput key={o} name={o} type="text" onChange={onChange} />
    ))

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
    const options = response.meta.can_include.map(o => (
      <OptionsLabel key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    ))

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
    const options = response.meta.can_filter.map(o => (
      <OptionsLabel key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    ))

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
        name="offset"
        type="number"
        value={params.offset}
      >
        Offset:
      </LabelInput>
      <LabelInput
        onChange={onChange}
        name="per_page"
        type="number"
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
            padding: "4px"
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
