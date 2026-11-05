# Governance and account model

## Account separation

The application is deployed through a dedicated CDK Stage. Its environment is resolved independently from the pipeline stack. By default both use the same account for a low-friction lab deployment. The `targetAccount` and `targetRegion` CDK context values allow the application stage to target a separate account and region.

A true multi-account rollout requires a second AWS account, a trusted CDK bootstrap in that account, and appropriate cross-account deployment permissions. This repository does not claim that a second account has been deployed until that process has been completed and verified.

## Least privilege

The Lambda function uses the CDK-generated execution role. Its SSM read grant is scoped to the single greeting parameter. The function does not need write, delete, parameter-history, or wildcard SSM permissions.

## Configuration classification

The greeting is intentionally a non-sensitive String parameter. Secrets and credentials must not be placed in source control, Lambda environment variables, or this parameter.

## Operational controls

The workflow is a Standard Step Functions state machine with execution logging and tracing. Lambda and workflow log groups have one-week retention for this short-lived lab. Source changes are version-controlled in GitHub and automatically tested before application deployment.
