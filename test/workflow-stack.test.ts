import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { WorkflowStack } from '../lib/workflow-stack';

describe('WorkflowStack', () => {
  const app = new cdk.App();
  const stack = new WorkflowStack(app, 'TestWorkflowStack');
  const template = Template.fromStack(stack);

  test('creates the required SSM parameter', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/app/config/greeting',
      Type: 'String'
    });
  });

  test('creates a Node.js 22 Lambda function', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Handler: 'index.handler'
    });
  });

  test('creates a scoped SSM read policy for the Lambda role', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(['ssm:GetParameter']),
            Effect: 'Allow',
            Resource: Match.anyValue()
          })
        ])
      })
    });
  });

  test('creates a Standard Step Functions state machine with logging', () => {
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineType: 'STANDARD',
      LoggingConfiguration: Match.objectLike({ Level: 'ALL' })
    });
  });
});
