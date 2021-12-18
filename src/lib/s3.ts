import config from '../../config';
import S3 from 'aws-sdk/clients/s3';

const { bucket, region } = config;

const s3 = new S3({ region });

function getPresignedParams(object_key: string) {
  return {
    Bucket: config.bucket,
    Fields: {
      key: object_key
    },

    Expires: 180
  };
}

function getResourceURL(object_key: string) {
  return object_key
    ? `https://${bucket}.s3.${region}.amazonaws.com/${object_key} `
    : '';
}

export { s3, getPresignedParams, getResourceURL };
