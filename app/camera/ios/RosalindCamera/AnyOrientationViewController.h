#ifndef AnyOrientationViewController_h
#define AnyOrientationViewController_h

@interface AnyOrientationViewController : UIViewController
@end

@implementation AnyOrientationViewController

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
  return UIInterfaceOrientationMaskAll;
}

@end

#endif /* AnyOrientationViewController_h */
