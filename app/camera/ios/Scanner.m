#import "Scanner.h"

@class ImageScannerController;

@implementation Scanner

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(open) {
  dispatch_async(dispatch_get_main_queue(), ^{
    ImageScannerController *scannerViewController = [[ImageScannerController alloc] init];

    UIWindow *window = [[UIApplication sharedApplication] keyWindow];
    UINavigationController * rootViewController = (UINavigationController *) window.rootViewController;

    [rootViewController presentViewController:scannerViewController animated:true completion:nil];
  });
}

@end
