import { APIGatewayProxyHandler } from 'aws-lambda';
import { SQS } from 'aws-sdk';

const sqs = new SQS();

export const handler: APIGatewayProxyHandler = async (event, context) => {
  let statusCode: number = 200;
  let message: string;

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No body was found',
      }),
    };
  }

  const region = context.invokedFunctionArn.split(':')[3];
  const accountId = context.invokedFunctionArn.split(':')[4];
  const queueName: string = 'receiverQueue';

  const queueUrl: string = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

  try {
    for (let i = 0; i < 30; i++) {
      await sqs
        .sendMessage({
          QueueUrl: queueUrl,
          MessageBody: `${event.body}+${i}`,
          MessageAttributes: {
            AttributeNameHere: {
              StringValue: 'Attribute Value Here',
              DataType: 'String',
            },
          },
        })
        .promise();
    }

    message = 'Message placed in the Queue!';
  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};
