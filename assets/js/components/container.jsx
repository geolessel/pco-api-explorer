import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"

const base64 = require("base-64")

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
  constructor({ name, self, children }) {
    this.name = name
    this.self = self
    this.children = children
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props)

    this.apiRoot = `http://api.pco.dev`
    const startingUrl = `${this.apiRoot}/people/v2`

    this.state = {
      app: "people",
      version: 2,
      tree: [],
      links: [],
      response: {},
      current: startingUrl,
      params: {}
    }

    API.key = base64.encode(`${this.props.applicationId}:${this.props.secret}`)

    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleOrderingChange = this.handleOrderingChange.bind(this)
    this.handleQueryingChange = this.handleQueryingChange.bind(this)
    this.currentURLWithExtraParams = this.currentURLWithExtraParams.bind(this)
    this.baseUrl = this.baseUrl.bind(this)
  }

  componentDidMount() {
    API.get(this.state.current, resp => {
      const node = new Node({
        name: "root",
        self: resp.data.links.self,
        children: resp.data.links
      })

      this.setState({
        response: resp,
        links: resp.data.links,
        tree: node
      })
    })
  }

  render() {
    const { current, response } = this.state
    const links = Object.keys(this.state.links).map(l => (
      <Link
        url={this.state.links[l]}
        onClick={c => this.handleLinkClick(this.state.links[l])}
        key={l}
        current={this.baseUrl() === this.state.links[l]}
      >
        {l}
      </Link>
    ))

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
            {links}
          </Flex>
          <Flex direction="column">
            <Ordering {...this.state} onChange={this.handleOrderingChange} />
            <Querying
              {...this.state}
              onChange={e => this.handleQueryingChange(e)}
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

  handleLinkClick(link) {
    console.log("link click", link)
    API.get(link, response => {
      this.setState({ response, current: link })
    })
  }

  handleOrderingChange(e) {
    const value = e.target.value
    let params = this.state.params

    if (value === "none") {
      delete params.order
    } else {
      params = Object.assign(params, { order: value })
    }
    this.setState({ params }, () => {
      const current = this.currentURLWithExtraParams()
      API.get(current, response => {
        this.setState({ current, response })
      })
    })
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

    this.setState({ params }, () => {
      const current = this.currentURLWithExtraParams()
      API.get(current, response => {
        this.setState({ current, response })
      })
    })
  }

  currentURLWithExtraParams(extraParams = {}) {
    const base = this.baseUrl()
    let params = Object.assign(this.state.params, extraParams)
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
