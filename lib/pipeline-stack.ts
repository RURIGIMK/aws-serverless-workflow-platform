import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { CodeStarConnectionsSourceCredentials } from 'aws-cdk-lib/aws-codepipeline';

export interface WorkflowPipelineStackProps extends cdk.StackProps {
  connectionArn: string;
  repository: string;
  branch: string;
}

export class WorkflowPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkflowPipelineStackProps) {
    super(scope, id, props);

    const source = pipelines.CodePipelineSource.connection(
      props.repository,
      props.branch,
      {
        connectionArn: props.connectionArn,
        triggerOnPush: true
      }
    );

    const synth = new pipelines.ShellStep('Synth', {
      input: source,
      commands: [
        'npm ci',
        'npm run build',
        'npm test -- --runInBand',
        'npx cdk synth'
      ]
    });

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'serverless-workflow-platform',
      pipelineType: cdk.aws_codepipeline.PipelineType.V2,
      synth,
      selfMutation: true,
      crossAccountKeys: true,
      dockerEnabledForSynth: false
    });

    const targetAccount = this.node.tryGetContext('targetAccount') ?? this.account;
    const targetRegion = this.node.tryGetContext('targetRegion') ?? this.region;
    const application = new WorkflowApplicationStage(this, 'Application', {
      env: { account: String(targetAccount), region: String(targetRegion) }
    });

    pipeline.addStage(application);
  }
}

class WorkflowApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);
    const { WorkflowStack } = require('./workflow-stack') as typeof import('./workflow-stack');
    new WorkflowStack(this, 'WorkflowStack', {
      env: props.env,
      description: 'Serverless workflow, SSM configuration, and least-privilege execution roles.'
    });
  }
}
