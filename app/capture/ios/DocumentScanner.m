#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(DocumentScanner, RCTEventEmitter)
RCT_EXTERN_METHOD(open)
RCT_EXTERN_METHOD(log:(NSString *)message)
@end
