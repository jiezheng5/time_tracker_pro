#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleS3Stack } from '../lib/simple-s3-stack';

const app = new cdk.App();
new SimpleS3Stack(app, 'time-tracking-app-simple', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
});
