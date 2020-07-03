#import "MediaResizer.h"
#include "ImageHelpers.h"
#import <React/RCTImageLoader.h>

@implementation MediaResizer

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createPreview:(NSString *)path
                  width:(float)width
                  height:(float)height
                  quality:(float)quality
                  callback:(RCTResponseSenderBlock)callback) {
  CGSize newSize = CGSizeMake(width, height);

  [[self->_bridge moduleForClass:[RCTImageLoader class]] loadImageWithURLRequest:[RCTConvert NSURLRequest:path] callback:^(NSError *error, UIImage *image) {
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

@end
