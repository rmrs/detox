//
//  ViewController.m
//  ___
//
//  Created by Leo Natan (Wix) on 22/05/2017.
//  Copyright © 2017 Wix. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad
{
	[super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
}


- (void)didReceiveMemoryWarning
{
	[super didReceiveMemoryWarning];
	// Dispose of any resources that can be recreated.
}

- (IBAction)_slowMyDeviceTapped:(id)sender
{
	NSDate* before = [NSDate date];
	
	while([before timeIntervalSinceNow] > -5);
}

- (IBAction)_slowMyBackgroundTapped:(id)sender {
	NSDate* before = [NSDate date];
	
	dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE, 0), ^{
		while([before timeIntervalSinceNow] > -10);
	});
}

- (IBAction)startNetworkRequestsTapped:(id)sender {
	[[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:@"https://jsonplaceholder.typicode.com/photos"] completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
		NSArray* arr = [NSJSONSerialization JSONObjectWithData:data options:0 error:NULL];
		__block NSUInteger executedRequests = 0;
		[arr enumerateObjectsUsingBlock:^(NSDictionary* _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
			if(executedRequests > 20)
			{
				*stop = YES;
			}
			
			executedRequests++;
			
			[[[NSURLSession sharedSession] dataTaskWithURL:[NSURL URLWithString:obj[@"thumbnailUrl"]] completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
				NSLog(@"");
			}] resume];
		}];
	}] resume];
}


@end
