import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"
import createStyledElement from "create-styled-element"
import ListItem from "./ui/ListItem"

const base64 = require("base-64")

const Headline = props => {
  const styles = {
    color: "#333333",
    fontSize: "18px",
    lineHeight: "24px",
    margin: "0 0 32px",
  }
  return createStyledElement("h1", props)(styles)
}

const OptionsLabel = props => {
  const styles = { display: "block" }
  return createStyledElement("label", props)(styles)
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
      params: {},
    }

    API.key = base64.encode(`${this.props.applicationId}:${this.props.secret}`)

    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleOrderingChange = this.handleOrderingChange.bind(this)
    this.handleQueryingChange = this.handleQueryingChange.bind(this)
    this.handleIncludingChange = this.handleIncludingChange.bind(this)
    this.handleFilteringChange = this.handleFilteringChange.bind(this)
    this.currentURLWithExtraParams = this.currentURLWithExtraParams.bind(this)
    this.baseUrl = this.baseUrl.bind(this)
  }

  componentDidMount() {
    API.get(this.state.current, resp => {
      const node = new Node({
        name: "root",
        self: resp.data.links.self,
        children: resp.data.links,
      })

      this.setState({
        response: resp,
        links: resp.data.links,
        tree: node,
      })
    })
  }

  render() {
    const { current, response } = this.state
    const links = Object.keys(this.state.links).map(l =>
      <ListItem
        link
        url={this.state.links[l]}
        onClick={c => this.handleLinkClick(this.state.links[l])}
        key={l}
        selected={this.baseUrl() === this.state.links[l]}
      >
        {l}
      </ListItem>
    )
    const { Div, Input } = createStyledElement

    return (
      <Div css={{ display: "flex" }}>
        <Div css={{ flexBasis: "200px", padding: "32px 0 0" }}>
          <Headline>API Tree</Headline>
          <div>{links}</div>
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
                marginRight: "32px",
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

  handleLinkClick(link) {
    console.log("link click", link)
    const params = {}
    API.get(link, response => {
      this.setState({ response, params, current: link })
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

  handleIncludingChange(e) {
    const { name, checked } = e.target
    console.log("including", name, checked)
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

    this.setState({ params }, () => {
      const current = this.currentURLWithExtraParams()
      API.get(current, response => {
        this.setState({ current, response })
      })
    })
  }

  handleFilteringChange(e) {
    const { name, checked } = e.target
    console.log("filtering", name, checked)
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

const Ordering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_order_by) {
    const options = response.meta.can_order_by.map(o =>
      <OptionsLabel key={o}>
        <input type="radio" name="orderBy" value={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    )

    return (
      <div>
        <h3>Ordering</h3>
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
      </div>
    )
  } else {
    return null
  }
}

const Querying = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_query_by) {
    const options = response.meta.can_query_by.map(o =>
      <OptionsLabel key={o}>
        {o}
        <input type="text" name={o} onChange={onChange} />
      </OptionsLabel>
    )

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
    const options = response.meta.can_include.map(o =>
      <OptionsLabel key={o}>
        <input type="checkbox" name={o} onChange={onChange} />
        {o}
      </OptionsLabel>
    )

    return (
      <div>
        <h3>Including</h3>
        <div>
          {options}
        </div>
      </div>
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
      <div>
        <h3>Filtering</h3>
        <div>
          {options}
        </div>
      </div>
    )
  } else {
    return null
  }
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
