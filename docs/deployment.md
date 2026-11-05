# Deployment runbook

This project uses a simple single-account deployment for the lab. GitHub Actions automatically builds, tests and synthesizes the CDK application when changes are pushed to main. AWS deployment is performed from an authenticated AWS CLI or AWS CloudShell session.

## 1. Validate the repository

The GitHub Actions workflow runs on pushes and pull requests to main. A successful run confirms TypeScript compilation, infrastructure tests, Lambda dependency installation and CDK synthesis.

## 2. Open AWS CloudShell

1. Sign in to the AWS account used for the lab.
2. Select US West (Oregon), us-west-2.
3. Open CloudShell from the AWS Console navigation bar.
4. Confirm the active identity:

```bash
aws sts get-caller-identity
aws configure get region
```

## 3. Deploy the application

Run:

```bash
git clone https://github.com/RURIGIMK/aws-serverless-workflow-platform.git
cd aws-serverless-workflow-platform
npm install
cd lambda/greeting
npm install --omit=dev
cd ../..
npm run build
npm test -- --runInBand
npx cdk bootstrap
npm run deploy
```

Review the CloudFormation changes and approve the deployment.

## 4. Verify the resources

Confirm that the deployment created:
- Step Functions state machine: serverless-greeting-workflow
- Lambda function: serverless-workflow-greeting
- SSM parameter: /app/config/greeting
- CloudWatch log groups for Lambda and Step Functions

## 5. Execute the workflow

1. Open Step Functions in the AWS Console.
2. Select serverless-greeting-workflow.
3. Choose Start execution.
4. Use this JSON input:

```json
{
  "source": "manual-capstone-test"
}
```

5. Start the execution and wait for Succeeded.
6. Confirm both workflow states succeeded.

## 6. Verify logs

Open CloudWatch, then Log groups, then /aws/lambda/serverless-workflow-greeting. Open the newest log stream and confirm the SSM_PARAMETER_READ event and /app/config/greeting parameter name.

## Deployment model

The lab deployment uses one AWS account because the provided student environment exposes one account. The CDK application is source-controlled and validated automatically through GitHub Actions. A separate account is not claimed unless one is separately provisioned and verified.
