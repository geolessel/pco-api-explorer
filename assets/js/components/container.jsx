import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"

const base64 = require("base-64")
const defaultPerPage = 25
const defaultPage = 1
const defaultParams = { per_page: defaultPerPage, page: defaultPage }

class API {
  static get(url, callback) {
    console.log("getting url", url)
    fetch(url, {
      headers: new Headers({
        Authorization: `Basic ${API.key}`
      })
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
      params: { per_page: defaultPerPage, page: defaultPage }
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
          path: this.computePath(data.links[k])
        })
      })
    } else if (Array.isArray(data)) {
      return data.map(
        d =>
          new Node({
            name: d.type,
            self: d.links.self,
            children: [],
            path: this.computePath(d.links.self)
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
        path: this.computePath(response.data.links.self)
      })

      this.setState({
        response: response,
        links: response.data.links,
        tree: node
      })
    })
  }

  render() {
    const { current, response, tree } = this.state

    return (
      <Grid size={12} gutter={{ x: 32, y: 16 }}>
        <Cell size={12}>
          <Flex direction="column">
            <CurrentLink current={current} />
          </Flex>
        </Cell>
        <Cell size={6}>
          <Flex>
            <h1>API Tree</h1>
          </Flex>
          <Flex direction="column">
            <Tree
              children={tree.children}
              onClick={this.handleLinkClick}
              key={tree.self}
            />
          </Flex>
          <Flex direction="column">
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
          </Flex>
        </Cell>
        <Cell size={6}>
          <Flex>
            <h1>Server Response</h1>
          </Flex>
          <Flex>
            <ReactJsonView
              src={response}
              collapsed={1}
              displayDataTypes={false}
            />
          </Flex>
        </Cell>
      </Grid>
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

const Tree = ({ children, onClick, style }) => {
  const tree = children.map(l => {
    let children
    if (l.children.length > 0) {
      children = <Tree children={l.children} onClick={onClick} />
    }

    return (
      <Link
        url={l.self}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onClick(l.self)
        }}
        key={l.self}
        current={false}
      >
        <strong>{l.name}</strong>
        {" "}
        -
        {" "}
        <small style={{ color: "#aaa" }}>/{l.path.join("/")}</small>
        {children}
      </Link>
    )
  })

  return (
    <div>
      {tree}
    </div>
  )
}

const Link = ({ url, onClick, current, children }) => {
  const style = {
    padding: "0.5rem",
    borderLeft: current ? "5px solid blue" : ""
  }

  return (
    <div onClick={onClick} style={style}>
      {children}
    </div>
  )
}

const Ordering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_order_by) {
    const options = response.meta.can_order_by.map(o => (
      <label key={o}>
        <input type="radio" name="orderBy" value={o} onChange={onChange} />
        {o}
      </label>
    ))

    return (
      <div>
        <h3>Ordering</h3>
        <Flex>
          <label key={"none"}>
            <input
              type="radio"
              name="orderBy"
              onChange={onChange}
              value="none"
              checked={params.order == undefined}
            />
            None
          </label>
          {options}
        </Flex>
      </div>
    )
  } else {
    return null
  }
}

const Querying = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_query_by) {
    const options = response.meta.can_query_by.map(o => (
      <label key={o}>
        {o}
        <input type="text" name={o} onChange={onChange} />
      </label>
    ))

    return (
      <Flex direction="column">
        <h3>Querying</h3>
        {options}
      </Flex>
    )
  } else {
    return null
  }
}

const Including = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_include) {
    const options = response.meta.can_include.map(o => (
      <label key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </label>
    ))

    return (
      <div>
        <h3>Including</h3>
        <Flex>
          {options}
        </Flex>
      </div>
    )
  } else {
    return null
  }
}

const Filtering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_filter) {
    const options = response.meta.can_filter.map(o => (
      <label key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </label>
    ))

    return (
      <div>
        <h3>Filtering</h3>
        <Flex>
          {options}
        </Flex>
      </div>
    )
  } else {
    return null
  }
}

const Limiting = ({ response, onChange, params }) => {
  return (
    <div>
      <h3>Limiting</h3>
      <div>
        <label htmlFor="page">Page:</label>
        {" "}
        <input
          type="text"
          name="page"
          value={params.page}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="perPage">Per page:</label>
        {" "}
        <input
          type="text"
          name="per_page"
          value={params.per_page}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

const CurrentLink = ({ current }) => {
  return (
    <div>
      <h3>Current Link</h3>
      <input
        style={{ width: "100%" }}
        readOnly={true}
        type="text"
        value={current}
      />
    </div>
  )
}

export default Container
