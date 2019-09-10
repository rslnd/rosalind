#import "Scanner.h"
#include "ImageHelpers.h"
#import <React/RCTImageLoader.h>

@class ImageScannerController;

@implementation Scanner

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

ImageScannerController *scannerViewController;

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"Scan"];
}

RCT_EXPORT_METHOD(createPreview:(NSString *)path
                  width:(float)width
                  height:(float)height
                  quality:(float)quality
                  callback:(RCTResponseSenderBlock)callback) {
  CGSize newSize = CGSizeMake(width, height);

  [_bridge.imageLoader loadImageWithURLRequest:[RCTConvert NSURLRequest:path] callback:^(NSError *error, UIImage *image) {
    if (error || image == nil) {
        callback(@[@"Can't retrieve the file from the path.", @""]);
        return;
    }

    // Do the resizing
    UIImage * scaledImage = [image scaleToSize:newSize];
    if (scaledImage == nil) {
      callback(@[@"Can't resize the image.", @""]);
      return;
    }

    NSData* jpegImage = UIImageJPEGRepresentation(scaledImage, quality / 100.0);

    if (jpegImage == nil) {
      callback(@[@"Can't represent as JPEG.", @""]);
      return;
    }

    NSString *base64Encoded = [jpegImage base64EncodedStringWithOptions:0];

    if (jpegImage == nil) {
      callback(@[@"Can't encode as base64.", @""]);
      return;
    }

    callback(@[[NSNull null], base64Encoded]);
  }];
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
  //[self sendEventWithName:@"Scan" body:@{@"name": @"Unicornooo"}];

  [scannerViewController dismissViewControllerAnimated:NO completion:nil];
}

@end
