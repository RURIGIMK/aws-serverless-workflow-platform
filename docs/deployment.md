# Deployment runbook

Follow the phases in the root README in order. The first user-controlled steps are AWS identity/region verification, creating and activating a GitHub CodeConnections connection, CDK bootstrap and pipeline deployment.

## Deployment boundaries

- Pipeline stack: deployed manually once from the pipeline account.
- Application stack: deployed by the self-mutating CDK Pipeline.
- Default application target: same account and region as the pipeline.
- Optional target: a different account/region through CDK Stage environment and bootstrap trust.

## Expected deployed resources

- CodePipeline: `serverless-workflow-platform`
- CloudFormation pipeline stack: `WorkflowPipelineStack`
- Application CloudFormation stack: `WorkflowPipelineStack-Application-WorkflowStack` (physical naming may include CDK-generated identifiers)
- SSM parameter: `/app/config/greeting`
- Lambda: `serverless-workflow-greeting`
- Step Functions state machine: `serverless-greeting-workflow`

## Manual execution payload

```json
{
  "source": "manual-capstone-test"
}
```

A successful run transitions from `PrepareWorkflow` to `ReadGreetingFromParameterStore`. The Lambda returns the retrieved greeting.
