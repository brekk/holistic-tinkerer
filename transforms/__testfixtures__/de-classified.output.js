const GrossSubElement = ({ children }) => {
  return <strong>{children}</strong>
};

const GrossOther = () => {
  return <strong>shit</strong>
};

const Gross = () => {
      super(props)
      this.state = {
        isMemoEditing: false,
        status: "init",
        isMemoVisible: props.ad.memo,
        recosVisible: false
      }
      return <div>{this.renderSubElement("codesmell")}</div>
};
