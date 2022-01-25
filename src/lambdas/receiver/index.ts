import { SQSHandler, SQSMessageAttributes } from 'aws-lambda';

export const handler: SQSHandler = async (event) => {
  try {
    console.log(JSON.stringify(event));

    for (const record of event.Records) {
      const messageAttributes: SQSMessageAttributes = record.messageAttributes;
      console.log(
        'Message Attributtes -->  ',
        messageAttributes.AttributeNameHere.stringValue,
      );
      console.log('Message Body -->  ', record.body);
      // Do something
    }
  } catch (error) {
    console.log(error);
  }
};
