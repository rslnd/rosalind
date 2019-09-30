import Foundation

@objc(DocumentScanner)
class DocumentScanner: RCTEventEmitter {
  @objc
  override func supportedEvents() -> [String] {
    return [
      "Scan"
    ]
  }

  @objc(open)
  func open() -> Void {
    NSLog("Hello from swift");
    self.sendEvent(
      withName: "Scan",
      body: "a scan event from swift"
    )
  }
}
