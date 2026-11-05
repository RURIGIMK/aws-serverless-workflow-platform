# Deployment and verification

## Automated deployment

AWS CodePipeline monitors the `main` branch of this repository through AWS CodeConnections. The pipeline runs in `eu-west-2` and deploys the CDK application stack to `us-west-2`.

The pipeline has three stages:

1. **Source** retrieves the latest GitHub revision.
2. **Build** runs `buildspec.yml` to install dependencies, compile TypeScript, run tests and synthesize the CDK template.
3. **Deploy** runs `deploy-buildspec.yml` to deploy `ServerlessWorkflowStack` to Oregon.

A push to `main` triggers the pipeline.

## Manual deployment

For an initial deployment or recovery outside the pipeline, use Node.js 22, AWS CLI credentials for the target account, and the CDK dependencies in this repository.

```bash
npm install
cd lambda/greeting && npm install --omit=dev && cd ../..
npm run build
npm test -- --runInBand
npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-west-2
DEPLOY_REGION=us-west-2 npx cdk deploy ServerlessWorkflowStack --require-approval never
```

## Workflow verification

The deployment creates:

- Step Functions state machine: `serverless-greeting-workflow`
- Lambda function: `serverless-workflow-greeting`
- SSM parameter: `/app/config/greeting`
- Lambda log group: `/aws/lambda/serverless-workflow-greeting`

Start a state machine execution with:

```json
{
  "source": "manual-capstone-test"
}
```

A successful execution returns the greeting read from Parameter Store. The Lambda log stream records an `SSM_PARAMETER_READ` event containing the parameter name and retrieved value.
