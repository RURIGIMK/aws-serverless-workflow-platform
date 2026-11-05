# Deployment runbook

## CI/CD pipeline

AWS CodePipeline is hosted in `eu-west-2` and uses the GitHub connection to monitor the `main` branch of this repository. A push to `main` triggers three stages:

1. **Source:** retrieves the latest GitHub revision.
2. **Build:** CodeBuild runs `buildspec.yml`, installs dependencies, builds TypeScript, runs infrastructure tests and synthesizes the CDK template.
3. **Deploy:** CodeBuild runs `deploy-buildspec.yml` and deploys `ServerlessWorkflowStack` to `us-west-2`.

The deploy build specification sets `CDK_DEFAULT_REGION=us-west-2` because the pipeline and application stack are in different AWS regions.

## Initial/manual deployment

For the first deployment, or recovery outside the pipeline:

1. Sign in to the AWS Academy account.
2. Select US West (Oregon), `us-west-2`.
3. Open CloudShell and confirm the active identity:

```bash
aws sts get-caller-identity
aws configure get region
```

4. Clone and deploy:

```bash
git clone https://github.com/RURIGIMK/aws-serverless-workflow-platform.git
cd aws-serverless-workflow-platform
npm install
cd lambda/greeting && npm install --omit=dev && cd ../..
npm run build
npm test -- --runInBand
npx cdk bootstrap
npm run deploy
```

Review the CloudFormation changes before approving deployment.

## Verify resources

Confirm that the deployment created:

- Step Functions state machine: `serverless-greeting-workflow`
- Lambda function: `serverless-workflow-greeting`
- SSM parameter: `/app/config/greeting`
- CloudWatch log groups for Lambda and Step Functions

## Execute the workflow

1. Open Step Functions in the AWS Console.
2. Select `serverless-greeting-workflow`.
3. Choose **Start execution**.
4. Use this JSON input:

```json
{
  "source": "manual-capstone-test"
}
```

5. Start the execution and wait for **Succeeded**.
6. Confirm both workflow states succeeded.

## Verify logs

Open CloudWatch, then Log groups, then `/aws/lambda/serverless-workflow-greeting`. Open the newest log stream and confirm the `SSM_PARAMETER_READ` event and `/app/config/greeting` parameter name.

## Account scope

The lab deployment uses one AWS account because the provided student environment exposes one account. A separate account is not claimed unless one is separately provisioned and verified.
