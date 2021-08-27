/*
* https://github.com/ancientec/password-policy-js
*
* Ancientec Co., Ltd. 
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

'use strict';

export class PasswordPolicy {
    //current policyName:
    public policyName = "";
    //all policies
    static policies : any = [];
    //all err strings
    static errorStrings : any = [];
    constructor(policy : any = {}, errStrings : any = {}, name: string = "default") {
        this.policyName = name;
        PasswordPolicy.registerPolicy(policy, errStrings, name);
    }
    public static registerPolicy(policy : any, errStrings : any, name: string = "default") : void {
        PasswordPolicy.policies[name] = Object.assign({}, policy);
        PasswordPolicy.errorStrings[name] = Object.assign({}, PasswordPolicy.getErrorStringsDefault(), errStrings);
    }
    public static setErrorStringsWithName(strs : any, name = "default") : void {
        PasswordPolicy.errorStrings[name] = Object.assign({}, strs);
    }
    public static getPolicies() {
        return PasswordPolicy.policies;
    }
    public setPolicyName(name : string) : void {
        this.policyName = name;
    }
    public static getPolicy(name : string) {
        if(name === "" && PasswordPolicy.policies.length === 1) {
            return Object.values(PasswordPolicy.policies)[0];
        }
        return typeof PasswordPolicy.policies[name] !== "undefined" ? PasswordPolicy.policies[name] : false; 
    }
    public static getPolicyDefault() {
        return {"LengthMin" : 8,
        "LengthMax" : 16,
        "CharDigitMin" : 1,
        "CharUpperMin" : 1,
        "CharLowerMin" : 1,
        "CharSpecial" : "~!@#$%^&*()-=_+",
        "CharSpecialMin" : 1,
        "MustContain" : [],
        "MustNotContain" : [],
        };
    }
    public static getErrorStringsDefault() {
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
    }
    public static errorString(errorStrings : any, err : string, values = []) {
        switch(err) {
            case 'ERR_CharSpecial':
                return errorStrings[err].replace("{0}",values[0]).replace("{1}",values[1]);
            case 'ERR_NoDefinedPolicies':
                return errorStrings[err];
            default:
            return errorStrings[err].replace("{0}",values[0]);
        }
    }
    public isValid(password : string, policyName : string = "") : boolean {

        if(policyName !== "" && typeof PasswordPolicy.policies[policyName] === "undefined") {
            //missing defined policies
            return false;
        }
        if(policyName === "") {
            policyName = this.policyName;
        }
        if(typeof PasswordPolicy.policies[policyName] === "undefined") {
            //missing defined policies
            return false;
        }
        const errs = this.validate(password, policyName);
        return Object.keys(errs).length === 0;
    }
    public validate(password : string, policyName : string = "") : any {
        let error : any = {};
        let err_all = [];

        if(policyName !== "" && typeof PasswordPolicy.policies[policyName] === "undefined") {
            //missing defined policies
            return {
                "ERR_NoDefinedPolicies" : PasswordPolicy.errorString(PasswordPolicy.getErrorStringsDefault(), "ERR_NoDefinedPolicies"),
                "ERR_All" : [PasswordPolicy.errorString(PasswordPolicy.getErrorStringsDefault(), "ERR_NoDefinedPolicies")]
            };
        }
        if(policyName === "") {
            policyName = this.policyName;
        }
        if(typeof PasswordPolicy.policies[policyName] === "undefined") {
            //missing defined policies
            return {
                "ERR_NoDefinedPolicies" : PasswordPolicy.errorString(PasswordPolicy.getErrorStringsDefault(), "ERR_NoDefinedPolicies"),
                "ERR_All" : [PasswordPolicy.errorString(PasswordPolicy.getErrorStringsDefault(), "ERR_NoDefinedPolicies")]
            };
        }

        const policy = PasswordPolicy.policies[policyName];
        const errStrs = PasswordPolicy.errorStrings[policyName];
        const ErrorStringFormat = typeof policy['ErrorStringFormat'] === "function" ? policy['ErrorStringFormat'] : function(err : string, values : any) {
            return PasswordPolicy.errorString(errStrs, err, values);
        };

        //check length:
        if(typeof policy["LengthMin"] !== "undefined" && password.length < policy['LengthMin']) {
            error["ERR_LengthMin"] = ErrorStringFormat("ERR_LengthMin", [policy['LengthMin']]);
            err_all.push(error["ERR_LengthMin"]);
        }
        if(typeof policy["LengthMax"] !== "undefined" && password.length > policy['LengthMax']) {
            error["ERR_LengthMax"] = ErrorStringFormat("ERR_LengthMax", [policy['LengthMax']]);
            err_all.push(error["ERR_LengthMax"]);
        }

        let matches = password.replace(/[^0-9]/g, '');
        if(typeof policy["CharDigitMin"] !== "undefined" && matches.length < policy['CharDigitMin']) {
            error["ERR_CharDigitMin"] = ErrorStringFormat("ERR_CharDigitMin", [policy['CharDigitMin']]);
            err_all.push(error["ERR_CharDigitMin"]);
        }

        matches = password.replace(/[^A-Z]/g, '');
        if(typeof policy["CharUpperMin"] !== "undefined" && matches.length < policy['CharUpperMin']) {
            error["ERR_CharUpperMin"] = ErrorStringFormat("ERR_CharUpperMin", [policy['CharUpperMin']]);
            err_all.push(error["ERR_CharUpperMin"]);
        }

        matches = password.replace(/[^a-z]/g, '');
        if(typeof policy["CharLowerMin"] !== "undefined" && matches.length < policy['CharLowerMin']) {
            error["ERR_CharLowerMin"] = ErrorStringFormat("ERR_CharLowerMin", [policy['CharLowerMin']]);
            err_all.push(error["ERR_CharLowerMin"]);
        }

        if(typeof policy["CharSpecialMin"] !== "undefined" && policy["CharSpecialMin"] > 0 && typeof policy["CharSpecial"] !== "undefined" && policy["CharSpecial"] !== "") {
            matches = password.replace(/[0-9]/g,"").replace(new RegExp("[^"+policy['CharSpecial'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+"]+","g"), "");
            if(matches.length < policy['CharSpecialMin']) {
                error["ERR_CharSpecial"] = ErrorStringFormat("ERR_CharSpecial", [policy['CharSpecialMin'],policy['CharSpecial']]);
                err_all.push(error["ERR_CharSpecial"]);
            }
            
        }
        if(typeof policy["MustContain"] !== "undefined" && policy["MustContain"].length > 0) {
            let errMustContain = [];
            for(var i = 0, t = policy["MustContain"].length; i < t; i++) {
                if(password.indexOf(""+policy["MustContain"][i]) === -1) {
                    errMustContain.push(ErrorStringFormat("ERR_MustContain", [policy["MustContain"][i]]));
                }
            }
            if(errMustContain.length > 0) {
                error['ERR_MustContain'] = errMustContain;
                err_all.push(...errMustContain);
            }
        }

        if(typeof policy["MustNotContain"] !== "undefined" && policy["MustNotContain"].length > 0) {
            let errMustNotContain = [];
            for(var i = 0, t = policy["MustNotContain"].length; i < t; i++) {
                if(password.indexOf(""+policy["MustNotContain"][i]) !== -1) {
                    errMustNotContain.push(ErrorStringFormat("ERR_MustNotContain", [policy["MustNotContain"][i]]));
                }
            }
            if(errMustNotContain.length > 0) {
                error['ERR_MustNotContain'] = errMustNotContain;
                err_all.push(...errMustNotContain);
            }
        }
        if(typeof policy["CustomValidate"] === "function") {
            const pass = policy['CustomValidate'](password);
            if(pass && pass.length > 0) {
                //error = is string or array
                error["ERR_CustomValidate"] = pass;
                if(typeof pass !== "string" && typeof pass[0] !== "undefined") {
                    err_all.push(...pass);
                } else {
                    err_all.push(error["ERR_CustomValidate"]);
                }
                
            }
        }

        if(err_all.length > 0) {
            error['ERR_All'] = err_all;
        }

        return error;

    }
}
