import React, { Component } from "react"

class MyComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMemoEditing: false,
      status: "init",
      isMemoVisible: props.ad.memo,
      recosVisible: false
    }
  }
  otherFunctionReferencingFunction(x) {
    this.yetAnotherMethod("more method")
    console.log("even harder", this.nonRenderFunction("oooo"))
    return this.nonRenderFunction(x)
  }
  nonRenderFunction(x) {
    return "cool" + x
  }
  yetAnotherMethod(whatever) {
    return ["nope", whatever]
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

export default MyComponent
