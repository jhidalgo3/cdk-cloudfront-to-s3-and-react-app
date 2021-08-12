import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3
    const bucket = new s3.Bucket(this, "CreateReactAppBucket", {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        { abortIncompleteMultipartUploadAfter: cdk.Duration.days(7) },
        { noncurrentVersionExpiration: cdk.Duration.days(7) },
      ],
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      versioned: true,
    });

    // Create a CloudFront distribution connected to the Lambda and the static content.
    const cfOriginAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "cfOriginAccessIdentity",
      {
        comment: "cfOriginAccessIdentity " + bucket.bucketName
      }
      
    );

    //const cloudfrontS3Access = new iam.PolicyStatement();
    //cloudfrontS3Access.addActions("s3:GetBucket*");
    //cloudfrontS3Access.addActions("s3:GetObject*");
    //cloudfrontS3Access.addActions("s3:List*");
    //cloudfrontS3Access.addResources(bucket.bucketArn);
    //cloudfrontS3Access.addResources(`${bucket.bucketArn}/*`);
    //cloudfrontS3Access.addCanonicalUserPrincipal(
    //  cfOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    //);

    //bucket.addToResourcePolicy(cloudfrontS3Access);

    // Deployment
    const src = new s3Deploy.BucketDeployment(this, "DeployCRA", {
      sources: [s3Deploy.Source.asset("../build")],
      destinationBucket: bucket
    });

    // Cloudfront
    const cf = new cloudfront.CloudFrontWebDistribution(this, "CDKCRAStaticDistribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: cfOriginAccessIdentity
          },
          behaviors: [{isDefaultBehavior: true}]
        },
      ]
    });


  }
}
