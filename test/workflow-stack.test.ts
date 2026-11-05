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

  test('grants the Lambda role read access to the greeting parameter', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'ssm:GetParameter',
            Effect: 'Allow',
            Resource: { 'Fn::GetAtt': [Match.stringLikeRegexp('GreetingParameter'), 'Arn'] }
          })
        ])
      }
    });
  });

  test('creates a Standard Step Functions state machine with logging', () => {
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineType: 'STANDARD',
      LoggingConfiguration: Match.objectLike({ Level: 'ALL' })
    });
  });
});
