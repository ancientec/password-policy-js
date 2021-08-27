# `password-policy` 

Javascript helper function to generate password policies and validate against password, for both server and browser.

PHP Version:
[https://github.com/ancientec/password-policy ](https://github.com/ancientec/password-policy)

JS Version (for frontend and backend):
[https://github.com/ancientec/password-policy-js ](https://github.com/ancientec/password-policy-js)

## Features
- Cache and validate multiple policies by assigning different names
- Customiziable error strings, multilingual possible
- Custom error handling
- Custom validation
- Detail errors
- Compatiable php version

## Install

```shell
> npm install password-policy
```
## Develop & Unit Test

```shell
> git clone https://github.com/ancientec/password-policy-js
> cd password-policy
> npm install
> npm run test
> npm build
```

## Usage & Example

```html
<!--quick start in html:-->
<script src="password-policy.min.js"></script>
<script>
    var passwordPolicy = new PasswordPolicy({"LengthMin" : 6}, {}, "policy_admin");
    passwordPolicy.isValid("password"); //return true
    passwordPolicy.validate("password"); //return {}
</script>
```

```js

import {PasswordPolicy} from 'password_policy';

const policy = {"LengthMin" : 6, //minimum length of password
      "LengthMax" : 12, //maximum length of password
      "CharDigitMin" : 1, //minimum number of digits
      "CharUpperMin" : 1,//minimum number of upper case characters
      "CharLowerMin" : 1,//minimum number of lower case characters
      "CharSpecial" : "~!@#%^&*()-=_+",//defination of special characters
      "CharSpecialMin" : 1,//minimum number of special characters
      "MustContain" : ['1','a'], //must contain strs, case sensitive
      "MustNotContain" : ['admin','password'],//must not contain strs, case sensitive
      "CustomValidate" : (password) => { return "";}, //return error string if false, return "" if true
    };

/**
 * variables:
 * policy : array,
 * errorStrings : array, optional
 * policy_name: string, optional
*/
const passwordPolicy = new PasswordPolicy(policy, {}, "policy_admin");

//return false:
passwordPolicy.isValid("password"); //false

//return true:
passwordPolicy.isValid("Password123!"); //true

//return empty array if the password is passed:
passwordPolicy.Validate("Password123!"); // empty {}

//return array of error strings:
passwordPolicy.Validate(""); 
/* result:
{"ERR_LengthMin" : "minimum length of 6",
        "ERR_LengthMax" :  "maximum length of 12",
        "ERR_CharDigitMin" : "at least 1 of digit(s)",
        "ERR_CharUpperMin" : "at least 1 of upper case character",
        "ERR_CharLowerMin" : "at least 1 of lower case character",
        "ERR_CharSpecial" : "at least 1 of special character ~!@#%^&*()-=_+",
        "ERR_MustContain" : ["must contain 1","must contain a"],
        "ERR_All" : [
              "maximum length of 12",
              "at least 1 of digit(s)",
              "at least 1 of upper case character",
              "at least 1 of lower case character",
              "at least 1 of special character ~!@#%^&*()-=_+",
              "must contain 1",
              "must contain a"
        ]
}
*/

```
The returned error array can be processed by using string index or by numeric index in ERR_All

## Multiple Policies

```js

//only check minimum length
const passwordPolicy = new PasswordPolicy({"LengthMin" : 6}, {}, "policy_admin");

//create a new instance
const passwordPolicyUser = new PasswordPolicy({"LengthMin" : 12}, {}, "policy_user");

//or use static.method
PasswordPolicy.registerPolicy({"LengthMin" : 32, "LengthMax" : 32}, {}, "policy_api");

//policy is still policy_admin:
passwordPolicy.isValid("Password123!");//return true

//change current policy name to policy_user
passwordPolicy.setPolicyName("policy_user");

//policy_user validate:
passwordPolicy.isValid("Password123!");//return false

//assign policy name to validate:
passwordPolicy.isValid("Password123!", "policy_admin");//return 



//policy is policy_user
passwordPolicyUser.isValid("Password123!");//return false

//assign policy name to validate:
passwordPolicy.isValid("Password123!", "policy_user");//return false

//assign policy name to validate:
passwordPolicy.isValid("Password123!", "policy_api");//return false

```

## Customizible Error Strings
```js

let errorStrings = PasswordPolicy.getErrorStringsDefault();
/* default strings:

{"ERR_LengthMin" : "minimum length should be {0}",
        "ERR_LengthMax" :  "maximum length should be {0}",
        "ERR_CharDigitMin" : "at least {0} of digit(s)",
        "ERR_CharUpperMin" : "at least {0} of upper case character",
        "ERR_CharLowerMin" : "at least {0} of lower case character",
        "ERR_CharSpecial" : "at least {0} of special character {1}",
        "ERR_MustContain" : "must contain {0}",
        "ERR_MustNotContain" : "must not contain {0}",
        "ERR_NoDefinedPolicies" : "Missing defined policies",
}
*/
errorStrings["ERR_LengthMin"] = "Minimum length must be {0}";

const passwordPolicy = new PasswordPolicy(
      {"LengthMin" : 6, "LengthMax" : 6},errorStrings, "policy_user");
//alertnatively:
passwordPolicy.setErrorStringsWithName(errorStrings, "policy_user");

passwordPolicy.validate("");
/* result:
{
      "ERR_LengthMin" : "minimum length must be 6",
      "ERR_All" : ["minimum length must be 6"]
}
*/

```

## Customizible Error String Functions
In case if you need to translate error strings dynamically during runtime. Note that all error strings should be covered if you define your own function:
```js

/*
error : string, type of error
values: string[], policy requirement
*/
const ErrorStringFormat = function(error, values) {

      const myLanguageStrings = {"ERR_LengthMin" : "minimum length must be {0}",
        "ERR_LengthMax" :  "maximum length must be {0}",
        "ERR_CharDigitMin" : "at least {0} of digit(s)",
        "ERR_CharUpperMin" : "at least {0} of upper case character",
        "ERR_CharLowerMin" : "at least {0} of lower case character",
        "ERR_CharSpecial" : "at least {0} of special character {1}",
        "ERR_MustContain" : "must contain {0}",
        "ERR_MustNotContain" : "must not contain {0}",
        "ERR_NoDefinedPolicies" : "Missing defined policies",
      };
      switch(error) {
            case 'ERR_CharSpecial':
                return myLanguageStrings[error].replace("{0}",values[0]).replace("{1}",values[1]);
            case 'ERR_NoDefinedPolicies':
                return myLanguageStrings[error];
            default:
            return myLanguageStrings[error].replace("{0}",values[0]);
      }
}

const policy = {
      "LengthMin" : 6, 
      "LengthMax" : 6,
      "ErrorStringFormat" : ErrorStringFormat};

const passwordPolicy = new PasswordPolicy(
      {"LengthMin" : 6, "LengthMax" : 6},errorStrings);

passwordPolicy.validate("");
/* result:
{
      "ERR_LengthMin" : "minimum length must be 6",
      "ERR_All" : ["minimum length must be 6"],
}
*/

```

## Custom Validation
Provide your own validation.
```js
const customValidate = function(password) {
      //password is not ok:
      if(password.indexOf('abc') !== 0) {
            return "password should prefix abc";
      }

      //password is ok:
      return "";
};

const passwordPolicy = new PasswordPolicy({
      "LengthMin" : 6,
      "CustomValidate" : customValidate
});

passwordPolicy.isValid("password"); //return false

passwordPolicy.validate("password");
/*
result:
{
      "ERR_CustomValidate" : "password should prefix abc",
      "ERR_All" : ["password should prefix abc"],
}
*/

passwordPolicy.isValid("abcPassword"); //return true
passwordPolicy.validate("abcPassword"); //result: {}

```

##Static Methods
Register new policies
```js
/*
policy: array,
errorStrings : array, optional
name: string, optional
*/
PasswordPolicy.registerPolicy(/*policy*/, /*errorStrings*/, /*name*/);
```

Set error strings
```js
/*
errorStrings : array,
name: string, optional
*/
PasswordPolicy.setErrorStringsWithName(/*errorStrings*/, /*name*/);
```

Get All registered policies
```js
/*
return array
*/
PasswordPolicy.getPolicies();
```

Get policy
```js
/*
return first policy
*/
PasswordPolicy.getPolicy();

/*
return  policy by name
*/
PasswordPolicy.getPolicy("default");
```

Get default policy definition
```js
/*
return {"LengthMin" : 8,
        "LengthMax" : 16,
        "CharDigitMin" : 1,
        "CharUpperMin" : 1,
        "CharLowerMin" : 1,
        "CharSpecial" : "~!@#%^&*()-=_+",
        "CharSpecialMin" : 1,
        "MustContain" : [],
        "MustNotContain" : [],
        }
*/
PasswordPolicy.getPolicyDefault();
```

Get default error strings definition
```js
/*
return {"ERR_LengthMin" : "minimum length should be {0}",
        "ERR_LengthMax" :  "maximum length should be {0}",
        "ERR_CharDigitMin" : "at least {0} of digit(s)",
        "ERR_CharUpperMin" : "at least {0} of upper case character",
        "ERR_CharLowerMin" : "at least {0} of lower case character",
        "ERR_CharSpecial" : "at least {0} of special character {1}",
        "ERR_MustContain" : "must contain {0}",
        "ERR_MustNotContain" : "must not contain {0}",
        "ERR_NoDefinedPolicies" : "Missing defined policies",
        };
*/
PasswordPolicy.getErrorStringsDefault();
```

## License

MIT