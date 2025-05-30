const validations = {
  password: /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{7,99}$/,
  email: /^[a-zA-Z0-9._+-]{1,65}@[a-zA-Z0-9.-]{1,65}\.[a-zA-Z]{2,5}$/,
  emailEasytrack: /^[a-zA-Z0-9._+-]{1,65}@easytrack\.mx$/,
  TOTPCode: /^(?=.*[0-9]).{6}/,
  number: /^([0-9.])+$/,
  rfc: /^([A-ZÑ&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])(([A-Z]|[0-9]){2}([A]|[0-9]){1})?)$/,
};

export default validations;
