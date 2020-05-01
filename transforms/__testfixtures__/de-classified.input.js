class Gross extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMemoEditing: false,
      status: "init",
      isMemoVisible: props.ad.memo,
      recosVisible: false
    }
  }
  renderSubElement({ children }) {
    return <strong>{children}</strong>
  }
  renderOther() {
    return <strong>shit</strong>
  }
  render() {
    return <div>{this.renderSubElement("codesmell")}</div>
  }
}
