'use strict';

import { PasswordPolicy } from "./password_policy";

if(typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.PasswordPolicy = PasswordPolicy;
}
