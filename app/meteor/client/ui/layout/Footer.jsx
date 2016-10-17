export const Footer = ({ customerName, printedStamp }) => (
  <div className="print-footer">
    <footer className="main-footer">
      <small>
        <strong className="text-muted">{customerName}&nbsp;</strong>
        <div className="pull-right text-muted">{printedStamp}</div>
      </small>
    </footer>
  </div>
)
