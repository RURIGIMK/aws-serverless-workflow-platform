#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WorkflowStack } from '../lib/workflow-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION ?? 'us-west-2';

// GitHub Actions can synthesize an environment-bound template without AWS
// credentials by supplying a placeholder account. Real deployments must use
// the account resolved by the CDK CLI from the active AWS credentials.
const deploymentAccount = account ?? (process.env.CI ? '111111111111' : undefined);

if (!deploymentAccount) {
  throw new Error('AWS account could not be resolved. Run CDK with valid AWS credentials.');
}

new WorkflowStack(app, 'ServerlessWorkflowStack', {
  env: { account: deploymentAccount, region },
  description: 'Serverless workflow with Lambda, Step Functions, SSM Parameter Store and CloudWatch.'
});

app.synth();
