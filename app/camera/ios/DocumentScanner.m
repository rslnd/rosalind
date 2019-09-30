#import "DocumentScanner.h"

@implementation DocumentScanner

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"Scan"];
}

RCT_EXPORT_METHOD(open)
{
  [self sendEventWithName:@"Scan" body:@{@"name": @"unicorn test"}];
}

@end
