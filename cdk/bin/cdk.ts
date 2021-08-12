#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'cdk-cra-s3-static', {
  env: {
    region: 'eu-west-1' // add your region
  }
});
