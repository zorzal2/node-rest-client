export default  {
  requestTimeout: process.env.REST_CLIENT_TIMEOUT ?
    Number.parseInt(process.env.REST_CLIENT_TIMEOUT, 10) : 120000
};
