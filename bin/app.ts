#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WorkflowPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION ?? 'us-west-2';
const connectionArn = process.env.GITHUB_CONNECTION_ARN;

if (!account) {
  throw new Error('CDK_DEFAULT_ACCOUNT is missing. Configure AWS credentials and run aws sts get-caller-identity.');
}
if (!connectionArn) {
  throw new Error('GITHUB_CONNECTION_ARN is missing. Create and activate an AWS CodeStar Connection for this GitHub repository, then export its ARN.');
}

new WorkflowPipelineStack(app, 'WorkflowPipelineStack', {
  env: { account, region },
  connectionArn,
  repository: 'RURIGIMK/aws-serverless-workflow-platform',
  branch: 'main',
  description: 'Self-mutating CI/CD pipeline for the AWS Serverless Workflow Platform capstone.'
});

app.synth();
