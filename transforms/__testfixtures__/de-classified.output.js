import React from 'react'

const otherFunctionReferencingFunction = x => {
  yetAnotherMethod("more method")
  console.log("even harder", nonRenderFunction("oooo"))
  return nonRenderFunction(x)
};

const nonRenderFunction = x => {
  return "cool" + x
};

const yetAnotherMethod = whatever => {
  return ["nope", whatever]
};

const MyComponentSubElement = ({ children }) => {
  return <strong>{children}</strong>
};

const MyComponentOther = () => {
  return <strong>shit</strong>
};

const MyComponent = () => {
    this.state = {
      isMemoEditing: false,
      status: "init",
      isMemoVisible: props.ad.memo,
      recosVisible: false
    }
    return <div><MyComponentSubElement>codesmell</MyComponentSubElement></div>
};
