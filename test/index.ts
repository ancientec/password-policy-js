/*
* https://github.com/ancientec/password-policy-js
*
* Ancientec Co., Ltd. 
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

'use strict';

import {expect} from 'chai';

import {PasswordPolicy} from '../src/password_policy';


describe('PasswordPolicy', () => {
    
	it('testMultiplePolicies', () => {
		const passwordPolicy1 = new PasswordPolicy({"LengthMin" : 5}, {}, "policy1");
		const passwordPolicy2 = new PasswordPolicy({"LengthMin" : 4}, {}, "policy2");

		const policy1 = PasswordPolicy.getPolicy("policy1");
		
		expect(policy1['LengthMin']).to.equal(5);

		const policy2 = PasswordPolicy.getPolicy("policy2");
		expect(policy2['LengthMin']).to.equal(4);

        const result1 = passwordPolicy2.isValid("1234", "policy1");
		expect(result1).to.equal(false);

		const result2 = passwordPolicy1.isValid("1234", "policy2");
		expect(result2).to.equal(true);
	});

	it('testRegisterPolicy', () => {
		PasswordPolicy.registerPolicy({"LengthMin" : 6}, {}, "policy3");
		expect(PasswordPolicy.policies["policy3"]['LengthMin']).to.equal(6);
	});
	it('setErrorStringsWithName', () => {
		PasswordPolicy.setErrorStringsWithName({"ERR_LengthMin" : "password requires at least {0} characters"}, "policy3");
		expect(PasswordPolicy.errorStrings["policy3"]['ERR_LengthMin']).to.equal("password requires at least {0} characters");
	});
});

describe('testLength', () => {
    
	it('testLengthMinError', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 6});
		expect(passwordPolicy.isValid("123")).to.equal(false);
		const result = passwordPolicy.validate("1234");
		expect(result).to.have.all.keys('ERR_LengthMin','ERR_All');
	});
	it('testLengthMaxError', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMax" : 12});
		expect(passwordPolicy.isValid("1234567890123")).to.equal(false);
		const result = passwordPolicy.validate("1234567890123");
		expect(result).to.have.all.keys('ERR_LengthMax','ERR_All');
	});
	it('testLengthOK', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 6, "LengthMax" : 12});
		expect(passwordPolicy.isValid("123456")).to.equal(true);
		expect(passwordPolicy.isValid("123456789012")).to.equal(true);
	});
});


describe('testErrorString', () => {
    
	it('testErrorString', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 6}, {"ERR_LengthMin" : "password requires at least {0} characters"}, "testErrorString");
		const result = passwordPolicy.validate("123");
		expect(result["ERR_LengthMin"]).to.equal("password requires at least 6 characters");
	});
});

describe('testCharDigit', () => {
    it('testCharDigitMinError', () => {
		const passwordPolicy = new PasswordPolicy({"CharDigitMin" : 2});
		expect(passwordPolicy.isValid("abcdef1")).to.equal(false);
		const result = passwordPolicy.validate("abcdef1");
		expect(result).to.have.all.keys('ERR_CharDigitMin','ERR_All');
	});
	it('testCharDigitMinOK', () => {
		const passwordPolicy = new PasswordPolicy({"CharDigitMin" : 2});
		expect(passwordPolicy.isValid("abcdef123")).to.equal(true);
	});
	
});

describe('testCharUpper', () => {
    it('testCharUpperMinError', () => {
		const passwordPolicy = new PasswordPolicy({"CharUpperMin" : 1});
		expect(passwordPolicy.isValid("abcdef123")).to.equal(false);
		const result = passwordPolicy.validate("abcdef123");
		expect(result).to.have.all.keys('ERR_CharUpperMin','ERR_All');
	});
	it('testCharUpperMinOK', () => {
		const passwordPolicy = new PasswordPolicy({"CharUpperMin" : 2});
		expect(passwordPolicy.isValid("abcdef123AB")).to.equal(true);
	});
	
});

describe('testCharLower', () => {
    it('testCharLowerMinError', () => {
		const passwordPolicy = new PasswordPolicy({"CharLowerMin" : 1});
		expect(passwordPolicy.isValid("ABCDEF123")).to.equal(false);
		const result = passwordPolicy.validate("ABCDEF123");
		expect(result).to.have.all.keys('ERR_CharLowerMin','ERR_All');
	});
	it('testCharLowerMinOK', () => {
		const passwordPolicy = new PasswordPolicy({"CharLowerMin" : 2});
		expect(passwordPolicy.isValid("ABCDEF123ab")).to.equal(true);
	});
	
});

describe('testCharSpecial', () => {
    it('testCharSpecialError', () => {
		const passwordPolicy = new PasswordPolicy({"CharSpecialMin" : 1, "CharSpecial" : "~!@#$%^&*()-=_+"});
		expect(passwordPolicy.isValid("ABCDEF123")).to.equal(false);
		const result = passwordPolicy.validate("ABCDEF123");
		expect(result).to.have.all.keys('ERR_CharSpecial','ERR_All');
	});
	it('testCharSpecialError2', () => {
		const passwordPolicy = new PasswordPolicy({"CharSpecialMin" : 1,  "CharSpecial" : "()"});
		expect(passwordPolicy.isValid("ABCDEF123!3424")).to.equal(false);
		const result = passwordPolicy.validate("ABCDEF123!3424");
		expect(result).to.have.all.keys('ERR_CharSpecial','ERR_All');
	});
	it('testCharSpecialOK', () => {
		const passwordPolicy = new PasswordPolicy({"CharSpecialMin" : 1,  "CharSpecial" : "~!@#$%^&*()-=_+"});
		expect(passwordPolicy.isValid("ABCDEF123!()")).to.equal(true);
	});
	
});

describe('testPasswordStrong', () => {
    it('testPasswordStrongOK', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 8,
        "LengthMax" : 16,
        "CharDigitMin" : 1,
        "CharUpperMin" : 1,
        "CharLowerMin" : 1,
        "CharSpecial" : "~!@#$%^&*()-=_+",
        "CharSpecialMin" : 1,
        "MustContain" : [],
        "MustNotContain" : [],
        });
		expect(passwordPolicy.isValid("abcDEF123!3424")).to.equal(true);
	});

});


describe('testCustomValidate', () => {
    it('testCustomValidate', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 8,
        "LengthMax" : 16,
        "CharDigitMin" : 1,
        "CharUpperMin" : 1,
        "CharLowerMin" : 1,
        "CharSpecial" : "~!@#$%^&*()-=_+",
        "CharSpecialMin" : 1,
        "MustContain" : [],
        "MustNotContain" : [],
		"CustomValidate" : (password : string) : any => { return "ERR_CustomValidate"+password;}
        });
		const result = passwordPolicy.validate("abCDEF123!3424");
		expect(result).to.have.all.keys('ERR_CustomValidate','ERR_All');
	});

});

describe('testErrorStringFormat', () => {
    it('testErrorStringFormat', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 6,
		"ErrorStringFormat" : (err : string, values : any) : string => { return "minimum length must be "+values[0];}
        });
		const result = passwordPolicy.validate("123");
		expect(result["ERR_LengthMin"]).equal("minimum length must be 6");
	});
	it('testErrorStringFormatCharSpecial', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 1, "CharSpecialMin" : 1, "CharSpecial" : "(=)",
		"ErrorStringFormat" : (err : string, values : any) : string => { return "must contain "+values[0]+" character(s) of "+values[1];}
        });
		const result = passwordPolicy.validate("123");
		expect(result["ERR_CharSpecial"]).equal("must contain 1 character(s) of (=)");
	});

});

describe('testMustContain', () => {
    it('testMustContain', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 1,"MustContain" : ["abc", "def", "123"]});
		const result = passwordPolicy.validate("123");
		expect(result["ERR_MustContain"].length).equal(2);
	});

});

describe('testMustNotContain', () => {
    it('testMustContain', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 1,"MustNotContain" : ["1", "2", "a"]});
		const result = passwordPolicy.validate("123");
		expect(result["ERR_MustNotContain"].length).equal(2);
	});

});

describe('testMissingPolicy', () => {
    it('testMissingPolicy', () => {
		const passwordPolicy = new PasswordPolicy({"LengthMin" : 1}, [], "exist");
		expect(passwordPolicy.isValid("123", "non_existing")).equal(false);
		const result = passwordPolicy.validate("123", "non_existing");
		expect(result["ERR_NoDefinedPolicies"]).equal("Missing defined policies");
	});

});