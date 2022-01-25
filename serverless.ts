import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'ercardona-sqs-test1',
  frameworkVersion: '2',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    lambdaHashingVersion: '20201221',
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['sqs:SendMessage'],
            Resource: {
              'Fn::GetAtt': ['${self:custom.queueName}', 'Arn'],
            },
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    sender: {
      handler: 'src/lambdas/sender/index.handler',
      events: [
        {
          http: {
            method: 'POST',
            path: 'send',
          },
        },
      ],
    },
    receiver: {
      handler: 'src/lambdas/receiver/index.handler',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['${self:custom.queueName}', 'Arn'],
            },
            batchSize: 10,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    queueName: 'receiverQueue',
  },
  resources: {
    Resources: {
      receiverQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'receiverQueue',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
