import { env } from '../config';
import S3 from 'aws-sdk/clients/s3';

const s3 = new S3({ region: env.region });

function getPresignedParams(object_key: string) {
  return {
    Bucket: env.bucket,
    Fields: {
      key: object_key,
      acl: 'public-read',
      success_action_status: '201'
    },
    Expires: 180
  };
}

export { s3, getPresignedParams };
