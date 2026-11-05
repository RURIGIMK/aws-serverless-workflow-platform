import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class WorkflowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const greeting = new ssm.StringParameter(this, 'GreetingParameter', {
      parameterName: '/app/config/greeting',
      stringValue: 'Hello from AWS Systems Manager Parameter Store',
      description: 'Runtime greeting read by the workflow Lambda function.',
      tier: ssm.ParameterTier.STANDARD
    });

    const functionLogs = new logs.LogGroup(this, 'GreetingFunctionLogs', {
      logGroupName: '/aws/lambda/serverless-workflow-greeting',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const greetingFunction = new lambda.Function(this, 'GreetingFunction', {
      functionName: 'serverless-workflow-greeting',
      description: 'Reads the greeting configuration from SSM Parameter Store at runtime.',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/greeting'),
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
      environment: {
        GREETING_PARAMETER_NAME: greeting.parameterName,
        LOG_LEVEL: 'INFO'
      },
      logGroup: functionLogs
    });

    greeting.grantRead(greetingFunction);

    const invokeGreeting = new tasks.LambdaInvoke(this, 'ReadGreetingFromParameterStore', {
      lambdaFunction: greetingFunction,
      payloadResponseOnly: true,
      taskTimeout: sfn.Timeout.duration(cdk.Duration.seconds(20))
    });

    invokeGreeting.addRetry({
      errors: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException', 'States.Timeout'],
      interval: cdk.Duration.seconds(2),
      backoffRate: 2,
      maxAttempts: 3
    });

    const workflow = new sfn.StateMachine(this, 'GreetingWorkflow', {
      stateMachineName: 'serverless-greeting-workflow',
      stateMachineType: sfn.StateMachineType.STANDARD,
      definitionBody: sfn.DefinitionBody.fromChainable(
        new sfn.Pass(this, 'PrepareWorkflow', {
          comment: 'Initial workflow state before invoking the configuration reader.'
        }).next(invokeGreeting)
      ),
      timeout: cdk.Duration.minutes(2),
      tracingEnabled: true,
      logs: {
        destination: new logs.LogGroup(this, 'WorkflowLogs', {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY
        }),
        level: sfn.LogLevel.ALL,
        includeExecutionData: true
      }
    });

    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: workflow.stateMachineArn,
      description: 'Use this ARN to start a manual Step Functions execution.'
    });
    new cdk.CfnOutput(this, 'GreetingLambdaName', { value: greetingFunction.functionName });
    new cdk.CfnOutput(this, 'GreetingParameterName', { value: greeting.parameterName });
  }
}
