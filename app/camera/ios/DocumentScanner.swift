import Foundation

@objc(DocumentScanner)
class DocumentScanner: NSObject {

  @objc(open)
  func open() -> Void {
    NSLog("Hello from swift");
  }

}
