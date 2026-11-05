const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssm = new SSMClient({});

exports.handler = async () => {
  const parameterName = process.env.GREETING_PARAMETER_NAME || '/app/config/greeting';
  const response = await ssm.send(new GetParameterCommand({
    Name: parameterName,
    WithDecryption: false
  }));

  const greeting = response.Parameter && response.Parameter.Value;
  if (!greeting) {
    throw new Error(`SSM parameter ${parameterName} did not contain a value`);
  }

  console.log(JSON.stringify({
    event: 'SSM_PARAMETER_READ',
    parameterName,
    greeting
  }));

  return {
    status: 'SUCCESS',
    parameterName,
    greeting,
    message: 'Configuration retrieved successfully.'
  };
};
