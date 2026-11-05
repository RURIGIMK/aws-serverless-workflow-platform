# Governance and account model

## Account model

The lab deployment uses the single AWS Academy account available to the student. Infrastructure is defined in AWS CDK and can be deployed into another account when a second account and the required permissions are available. This repository does not claim that a separate account has been deployed.

## Least privilege

The Lambda function uses its CDK-generated execution role. Its SSM read grant is scoped to the single greeting parameter. The function does not need write, delete, parameter-history or wildcard SSM permissions.

## Configuration classification

The greeting is intentionally a non-sensitive String parameter. Secrets and credentials must not be placed in source control or this parameter.

## Operational controls

The workflow is a Standard Step Functions state machine with execution logging and tracing. Lambda and workflow log groups have one-week retention for this short-lived lab. GitHub Actions automatically builds, tests and synthesizes infrastructure changes on pushes and pull requests to main. Deployment is performed by an authenticated operator from AWS CloudShell after reviewing the change.
