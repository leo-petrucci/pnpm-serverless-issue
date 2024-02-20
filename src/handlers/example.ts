import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const client = new CloudFrontClient();

type InvalidationEvent = {
  distributionId?: string;
};

export const handler = async (event: any) => {
  const { distributionId } =
    event.queryStringParameters ?? ({} as InvalidationEvent);
  console.log(`Distribution invalidation request: ${distributionId}`);

  if (!distributionId) {
    return {
      statusCode: 400,
      body: "No distribution Id provided",
    };
  }

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: { Quantity: 1, Items: ["/*"] },
        CallerReference: `CloudfrontInvalidatorApi-${new Date().toUTCString()}`,
      },
    });

    await client.send(command);
    console.log(`Successfully sent invalidation request to Cloudfront`);

    return {
      statusCode: 202,
    };
  } catch (err) {
    console.log(
      `Error invalidating distribution ${distributionId}`,
      JSON.stringify(err)
    );

    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
