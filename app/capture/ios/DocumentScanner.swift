import os
import Foundation
import WeScan

@objc(DocumentScanner)
class DocumentScanner: RCTEventEmitter, ImageScannerControllerDelegate {
  func imageScannerController(_ scanner: ImageScannerController, didFinishScanningWithResults results: ImageScannerResults) {
    os_log("Scanner: finished")

    let scanned = (results.doesUserPreferEnhancedScan
      ? (results.enhancedScan ?? results.croppedScan)
      : results.croppedScan)

    let jpeg = scanned.image.jpegData(compressionQuality: 0.9)

    let localPath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(UUID().uuidString + ".jpeg")

    os_log("Writing jpeg to %s", localPath.absoluteString)

    do {
      try jpeg!.write(to: localPath)

      let media =  [
        "localPath": localPath.absoluteString,
        "mediaType": "image/jpeg",
        "height": scanned.image.size.height * scanned.image.scale,
        "width": scanned.image.size.width * scanned.image.scale
      ] as [String : Any]

      self.sendEvent(
        withName: "Scan",
        body: media
      )

      scanner.dismiss(animated: true)
    } catch {
      os_log("Failed to write scanned UIImage as jpeg")
    }
  }

  func imageScannerControllerDidCancel(_ scanner: ImageScannerController) {
    os_log("Scanner: canceled")
    scanner.dismiss(animated: true)
  }

  func imageScannerController(_ scanner: ImageScannerController, didFailWithError error: Error) {
    os_log("Scanner: error %@", error.localizedDescription)
    scanner.dismiss(animated: true)
  }

  @objc
  override func supportedEvents() -> [String] {
    return [
      "Scan"
    ]
  }


  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(log:)
  func log(message: String) -> Void {
    os_log("[console.log] %s", message)
  }


  @objc(open)
  func open() -> Void {
    os_log("DocumentScanner: Requested open scanner");

    DispatchQueue.main.async {
      let scannerViewController = ImageScannerController()

      scannerViewController.modalPresentationStyle = .fullScreen
      scannerViewController.imageScannerDelegate = self

      let rootViewController:UIViewController?
      = UIApplication.shared.delegate?.window??.rootViewController!

      rootViewController!.present(scannerViewController, animated: true)
    }
  }
}
