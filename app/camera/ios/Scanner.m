#import "Scanner.h"

@class ImageScannerController;

@implementation Scanner

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

ImageScannerController *scannerViewController;

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"Scan"];
}

RCT_EXPORT_METHOD(initialize) {
}

RCT_EXPORT_METHOD(open) {
  dispatch_async(dispatch_get_main_queue(), ^{
    scannerViewController = [[ImageScannerController alloc] init];

    UIWindow *window = [[UIApplication sharedApplication] keyWindow];
    UINavigationController *rootViewController = (UINavigationController *) window.rootViewController;

    [rootViewController presentViewController:scannerViewController animated:NO completion:nil];
  });
}

-(void)imageDataFromWeScan:(NSNotification*)notify {
  //NSData *imgData = [notify object];
  //UIImage *img = [UIImage imageWithData:imgData];
  [self sendEventWithName:@"Scan" body:@{@"name": @"Unicornooo"}];

  [scannerViewController dismissViewControllerAnimated:NO completion:nil];
}

@end
