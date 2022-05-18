const sucessResponse = (
  res,
  data = null,
  statusCode = null,
  message = null
) => {
  return res.send({
    data: data,
    meta: {
      message: message,
      flag: "SUCCESS",
      statuscode: statusCode,
    },
  });
};

const failResponse = (res, data = null, statusCode = null, message = null) => {
  return res.send({
    data: {},
    meta: {
      message: message,
      flag: "FAIL",
      statuscode: statusCode,
    },
  });
};

module.exports = { sucessResponse, failResponse };
