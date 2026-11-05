#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WorkflowStack } from '../lib/workflow-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION ?? 'us-west-2';

if (!account) {
  throw new Error('CDK_DEFAULT_ACCOUNT is missing. Configure AWS credentials before deploying.');
}

new WorkflowStack(app, 'ServerlessWorkflowStack', {
  env: { account, region },
  description: 'Serverless workflow with Lambda, Step Functions, SSM Parameter Store and CloudWatch.'
});

app.synth();
