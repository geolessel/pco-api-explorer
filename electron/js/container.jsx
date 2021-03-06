import React from "react"
import { Flex, Grid, Cell } from "golly"
import ReactJsonView from "react-json-view"
import createStyledElement from "create-styled-element"
import _ from "underscore"
import ReactLoading from "react-loading" // https://github.com/fakiolinho/react-loading
import CopyToClipboard from "react-copy-to-clipboard"
import Mousetrap from "mousetrap"

import Button from "./ui/button.jsx"
import Footer from "./ui/footer.jsx"
import FormInput from "./ui/form_input.jsx"
import Header from "./ui/header.jsx"
import Headline from "./ui/headline.jsx"
import ListItem from "./ui/list_item.jsx"
import NavLink from "./ui/nav_link.jsx"
import OptionsLabel from "./ui/options_label.jsx"
import Pane from "./ui/pane.jsx"
import TextInput from "./ui/text_input.jsx"
import TextWrapper from "./ui/text_wrapper.jsx"

const base64 = require("base-64")
const electron = window.require("electron")

const defaultPerPage = 25
const defaultOffset = 0
const defaultParams = {
  per_page: "",
  offset: "",
  custom: "",
  include: [],
  querying: []
}
const debounceTime = 500

// const log = true
const log = false
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

  log(...terms) {
    if (log) {
      window.console.log(...terms)
    }
  }
}

const setAPIKey = (id, secret) => {
  API.key = base64.encode(`${id}:${secret}`)
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
  constructor({ name, self, children, path, childrenIds, id, type }) {
    this.name = name
    this.self = self
    this.children = children
    this.path = path
    this.id = id
    this.type = type
    this.childrenIds = childrenIds
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props)

    const apiId = window.localStorage.apiId
    const apiSecret = window.localStorage.apiSecret
    const apiRoot =
      window.sessionStorage.apiRoot || `https://api.planningcenteronline.com`
    const apiVersion = "v2"

    setAPIKey(apiId, apiSecret)

    const startingTree = [
      new Node({
        name: "check_ins",
        self: `${apiRoot}/check_ins/${apiVersion}`,
        children: [],
        childrenIds: [],
        path: ["check_ins", apiVersion]
      }),
      new Node({
        name: "giving",
        self: `${apiRoot}/giving/${apiVersion}`,
        children: [],
        childrenIds: [],
        path: ["giving", apiVersion]
      }),
      new Node({
        name: "people",
        self: `${apiRoot}/people/${apiVersion}`,
        children: [],
        childrenIds: [],
        path: ["people", apiVersion]
      }),
      new Node({
        name: "services",
        self: `${apiRoot}/services/${apiVersion}`,
        children: [],
        childrenIds: [],
        path: ["services", apiVersion]
      })
    ]

    this.state = {
      tree: { children: startingTree },
      baseUrl: apiRoot,
      response: {},
      currentNode: null,
      currentURL: "",
      params: defaultParams,
      isFetching: false,
      selectedId: null,
      apiId: apiId,
      apiSecret: apiSecret,
      credentialsStored: !!apiId && !!apiSecret
    }

    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleOrderingChange = this.handleOrderingChange.bind(this)
    this.handleQueryingChange = _.debounce(
      this.handleQueryingChange.bind(this),
      debounceTime
    )
    this.handleIncludingChange = this.handleIncludingChange.bind(this)
    this.handleFilteringChange = this.handleFilteringChange.bind(this)
    this.handleLimitingChange = _.debounce(
      this.handleLimitingChange.bind(this),
      debounceTime
    )
    this.handleCustomChange = _.debounce(
      this.handleCustomChange.bind(this),
      debounceTime
    )
    this.handleIDChange = this.handleIDChange.bind(this)
    this.currentURLWithExtraParams = this.currentURLWithExtraParams.bind(this)
    this.updateParams = this.updateParams.bind(this)
    this.createChildren = this.createChildren.bind(this)
    this.findNodeBySelf = this.findNodeBySelf.bind(this)
    this.baseUrl = this.baseUrl.bind(this)
    this.computePath = this.computePath.bind(this)
  }

  componentDidMount() {
    window.console.log(
      "%cYou seem interested in how things work.\nWant to work at Planning Center?\nhttps://planning.center/careers",
      "color: blue"
    )
    Mousetrap.bind("command+option+i", () =>
      electron.remote.BrowserWindow.getFocusedWindow().toggleDevTools()
    )
  }

  render() {
    const {
      currentURL,
      currentNode,
      response,
      tree,
      credentialsStored,
      apiId,
      apiSecret
    } = this.state
    const { Div, Input, Span } = createStyledElement

    return (
      <Div
        css={{
          display: "flex",
          overflow: "hidden",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <Header>Planning Center API Explorer</Header>
        {credentialsStored
          ? <Div
              css={{
                background: "#fafafa",
                display: "flex",
                flex: "1",
                paddingTop: "88px",
                paddingBottom: "32px"
              }}
            >
              <Div css={{ flexBasis: "200px" }}>
                <Tree
                  parent={tree}
                  children={tree.children}
                  onClick={this.handleLinkClick}
                  currentURL={this.baseUrl()}
                />
              </Div>
              <Div
                css={{
                  background: "#f7f7f7",
                  flex: "1",
                  minWidth: "0",
                  padding: "32px"
                }}
              >
                <Pane
                  css={{
                    alignItems: "flex-start",
                    background: "#eeeeee",
                    display: "flex",
                    lineHeight: "24px",
                    marginBottom: "32px",
                    minHeight: "24px"
                  }}
                >
                  <Div css={{ flex: "0 0 auto", fontWeight: "700" }}>
                    Current URL:
                  </Div>
                  {currentURL
                    ? <TextWrapper>{currentURL}</TextWrapper>
                    : <TextWrapper transparent>none selected</TextWrapper>}
                  {currentURL &&
                    <CopyToClipboard
                      text={currentURL}
                      onCopy={() => this.setState({ copied: true })}
                    >
                      <Div css={{ flex: "0 0 auto" }}>
                        <Button>Copy to clipboard</Button>
                      </Div>
                    </CopyToClipboard>}
                </Pane>
                <Div
                  css={{
                    display: "flex",
                    flex: "1",
                    "@media(max-width: 1000px)": {
                      flexDirection: "column"
                    }
                  }}
                >
                  <Div
                    css={{
                      flex: "0 4 400px",
                      margin: "0 32px 0 0",
                      minWidth: "0",
                      overflow: "hidden",
                      textOverflow: "ellipses",
                      whiteSpace: "nowrap",
                      "@media(max-width: 1000px)": { flex: "1", margin: "0 0 32px" },
                    }}
                  >
                    <Headline>URL Parameters</Headline>
                    <ID
                      parent={this.recursivelyFindByPath(
                        this.computePath(currentURL).slice(0, -1),
                        tree
                      )}
                      currentNode={currentNode}
                      onChange={e => this.handleIDChange(e)}
                    />
                    <Ordering
                      {...this.state}
                      onChange={this.handleOrderingChange}
                    />
                    <Querying
                      {...this.state}
                      onChange={e => {
                        e.persist()
                        this.handleQueryingChange(e)
                      }}
                    />
                    <Including
                      {...this.state}
                      onChange={e => this.handleIncludingChange(e)}
                    />
                    <Filtering
                      {...this.state}
                      onChange={e => this.handleFilteringChange(e)}
                    />
                    {!this.isResource(currentNode) &&
                      <Limiting
                        {...this.state}
                        onChange={e => {
                          e.persist()
                          this.handleLimitingChange(e)
                        }}
                      />}
                    <Custom
                      {...this.state}
                      onChange={e => {
                        e.persist()
                        this.handleCustomChange(e)
                      }}
                    />
                  </Div>
                  <Div css={{ flex: "1 1 400px", minWidth: "0" }}>
                    <Headline>Server Response</Headline>
                    <Pane theme="dark" css={{ overflow: "scroll" }}>
                      {this.state.isFetching
                        ? <ReactLoading type="cylon" color="#777" delay={0} />
                        : <ReactJsonView
                            collapsed={2}
                            displayDataTypes={false}
                            src={response}
                            theme="ocean"
                          />}
                    </Pane>
                  </Div>
                </Div>
              </Div>
            </Div>
          : this.renderSetup()}
        <Footer>
          <div>a Geoffrey Lessel & Jesse J. Anderson joint</div>
          <div>Copyright © 2017 Planning Center</div>
        </Footer>
      </Div>
    )
  }

  renderSetup() {
    const { apiId, apiSecret } = this.state
    const { Div, Input, Label } = createStyledElement
    return (
      <Div
        css={{
          background: "#fafafa",
          display: "flex",
          flex: "1",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Pane
          css={{
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            padding: "24px",
            width: "400px",
            "@media(max-width:600px)": { width: "calc(100% - 64px)" }
          }}
        >
          <Div css={{ marginBottom: "32px", textAlign: "center" }}>
            <Headline>Let's get started!</Headline>
            <p>We just need your API credentials.</p>
            <p style={{ marginTop: "1rem" }}>
              <a
                href="#"
                onClick={() =>
                  electron.shell.openExternal(
                    "https://api.planningcenteronline.com/oauth/applications"
                  )}
              >
                Find or create your Personal Access Token
              </a>
            </p>
          </Div>
          <Div css={{ marginBottom: "32px" }}>
            <TextInput
              name="apiId"
              id="apiId"
              type="text"
              defaultValue={apiId}
              placeholder="Paste in your Planning Center API App ID"
            >
              App Id:
            </TextInput>
            <TextInput
              name="apiSecret"
              id="apiSecret"
              type="text"
              defaultValue={apiSecret}
              placeholder="Paste in your Planning Center API App Secret"
            >
              App Secret:
            </TextInput>
          </Div>
          <Button
            theme="success"
            size="lg"
            onClick={() => {
              const id = document.getElementById("apiId").value
              const secret = document.getElementById("apiSecret").value
              this.setState(
                {
                  apiId: id,
                  apiSecret: secret,
                  credentialsStored: !!id && !!secret
                },
                () => {
                  localStorage.apiId = id
                  localStorage.apiSecret = secret
                  setAPIKey(id, secret)
                }
              )
            }}
            css={{ textAlign: "center" }}
          >
            Save Credentials
          </Button>
        </Pane>
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
          const name = isNaN(Number(path.slice(-1))) ? k : "ID"
          const parent = this.recursivelyFindByPath(path.slice(0, -1), tree)

          if (parent) {
            parent.children.push(
              new Node({
                self: data.links[k],
                type: k,
                children: [],
                id: Number(data.id),
                name,
                path
              })
            )
          }
          parent.children = _.uniq(parent.children, false, c => c.self)
        }
      })
    } else if (Array.isArray(data)) {
      data.forEach(d => {
        const path = this.computePath(d.links.self)
        const name = isNaN(Number(path.slice(-1))) ? k : "ID"
        const parent = this.recursivelyFindByPath(path.slice(0, -1), tree)

        if (parent) {
          parent.children.push(
            new Node({
              self: d.links.self,
              type: d.type,
              children: [],
              id: Number(d.id),
              name,
              path
            })
          )
          parent.children = _.uniq(parent.children, false, c => c.self)
          parent.childrenIds = parent.children.map(c => c.id)
        }
      })
    }
  }

  handleLinkClick(currentNode) {
    console.groupCollapsed("handleLinkClick")
    console.log("click", currentNode)
    let selectedId
    if (this.isResource(currentNode)) {
      selectedId = currentNode.path.slice(-1)[0]
    } else {
      selectedId = null
    }
    this.setState(
      {
        currentNode,
        selectedId,
        currentURL: currentNode.self
      },
      () => {
        this.updateParams({ include: [], querying: [], filtering: [] })
      }
    )
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

  handleCustomChange(e) {
    let params = this.state.params
    params = Object.assign(params, { custom: e.target.value })
    this.updateParams(params)
  }

  handleIDChange(e) {
    this.setState({ selectedId: e.target.value })
    this.updateParams(this.state.params)
  }

  findNodeBySelf(link) {
    return this.state.tree.children.find(n => n.self === link)
  }

  updateParams(params) {
    this.setState({ params, isFetching: true }, () => {
      const currentURL = this.currentURLWithExtraParams()
      API.get(currentURL, response => {
        console.groupCollapsed("updateParams")
        let tree = this.state.tree
        this.createChildren({ response })
        this.setState({ currentURL, response, tree, isFetching: false })
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
    if (params.custom == "") {
      delete params.custom
    }
    ;["include", "querying", "filtering"].forEach(p => {
      if (params[p] && params[p].length < 1) {
        delete params[p]
      }
    })
    let newParams = Object.keys(params)
      .filter(p => p !== "custom")
      .map(k => `${k}=${params[k]}`)
    params.custom && newParams.push(params.custom)
    newParams = newParams.join("&")
    if (newParams.length > 0) {
      return `${base}?${newParams}`
    } else {
      return base
    }
  }

  baseUrl() {
    const { currentNode, selectedId } = this.state
    if (this.isResource(currentNode)) {
      return currentNode.self.replace(/\/\d+$/, `/${selectedId}`)
    } else {
      return currentNode && currentNode.self
    }
  }

  isResource(node) {
    if (node === null) {
      return false
    } else {
      return node.path && node.path.slice(-1)[0].match(/^\d+$/)
    }
  }

  computePath(link) {
    if (link === null) {
      return []
    }
    let path = link.replace(this.state.baseUrl, "").split("/")
    path.shift()
    return path
  }
}

const Tree = ({
  parent,
  children,
  childrenIds,
  currentURL,
  onClick,
  style
}) => {
  const tree = children.map(l => {
    let childTree
    if (l.children.length > 0) {
      childTree = (
        <Tree
          parent={l}
          key={`${l.self}-children`}
          children={_.uniq(l.children, false, c => c.name)}
          onClick={onClick}
          currentURL={currentURL}
        />
      )
    }

    const { Div } = createStyledElement
    const display = l.name == "<id>" ? "ID" : l.name

    return (
      <div key={l.self} style={{}}>
        <NavLink
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onClick(l)
          }}
          key={l.self}
          selected={currentURL === l.self}
          level={l.path.length - 1}
        >
          {display}
        </NavLink>
        {childTree}
      </div>
    )
  })

  return (
    <div>
      {tree}
    </div>
  )
}

const ID = ({ onChange, parent, currentNode }) => {
  if (parent && parent.childrenIds && parent.childrenIds.length > 0) {
    const options = parent.children.map(c => (
      <option key={c.id} value={c.id}>{c.id}</option>
    ))

    return (
      <Pane>
        <Headline tag="h2">{currentNode.type} ID</Headline>
        <select name={`${parent.name}_id`} onChange={onChange}>
          {options}
        </select>
      </Pane>
    )
  } else {
    return null
  }
}

const Ordering = ({ response, onChange, params }) => {
  if (response && response.meta && response.meta.can_order_by) {
    const options = response.meta.can_order_by.map(o => (
      <FormInput
        id={o}
        key={`order-${o}`}
        type="radio"
        name="orderBy"
        value={o}
        checked={params.order === o}
        selected={params.order === o}
        onChange={onChange}
      >
        {o}
      </FormInput>
    ))

    return (
      <Pane>
        <Headline tag="h2">Ordering</Headline>
        <div>
          <FormInput
            key="ordering-none"
            type="radio"
            name="orderBy"
            onChange={onChange}
            value="none"
            checked={params.order == undefined}
            selected={!params.order}
          >
            none
          </FormInput>
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
      <TextInput key={o} name={o} type="text" onChange={onChange} />
    ))

    return (
      <Pane>
        <Headline tag="h2">Querying</Headline>
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
      <FormInput
        id={o}
        key={o}
        type="checkbox"
        name={o}
        onChange={onChange}
        checked={params.include && params.include.includes(o)}
        selected={params.include && params.include.includes(o)}
      >
        {o}
      </FormInput>
    ))

    return (
      <Pane>
        <Headline tag="h2">Including</Headline>
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
      <FormInput
        id={o}
        key={o}
        type="checkbox"
        name={o}
        onChange={onChange}
        checked={params.filter && params.filter.includes(o)}
        selected={params.filter && params.filter.includes(o)}
      >
        {o}
      </FormInput>
    ))

    return (
      <Pane>
        <Headline tag="h2">Filtering</Headline>
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
      <Headline tag="h2">Limiting</Headline>
      <TextInput
        onChange={onChange}
        name="offset"
        type="number"
        defaultValue={params.offset}
        placeholder={`default is ${defaultOffset}`}
      >
        Offset:
      </TextInput>
      <TextInput
        onChange={onChange}
        name="per_page"
        type="number"
        defaultValue={params.per_page}
        placeholder={`default is ${defaultPerPage}`}
      >
        Per page:
      </TextInput>
    </Pane>
  )
}

const Custom = ({ response, onChange, params }) => {
  return (
    <Pane>
      <Headline tag="h2">Custom Parameters</Headline>
      <TextInput
        onChange={onChange}
        name="custom"
        type="text"
        defaultValue={params.custom}
      >
        Custom:
      </TextInput>
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
