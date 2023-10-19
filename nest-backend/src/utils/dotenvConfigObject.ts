const dotenvConfigObject = {
  path: process.env.NODE_ENV
    ? `${__dirname}/../envs/${process.env.NODE_ENV}.env`
    : `${__dirname}/../envs/local.env`,
};

export default dotenvConfigObject;