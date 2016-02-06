"use strict";
$(document).ready(function () {
    var parms = getQueryParameters(document.location.search);
    var cd = parms.vc;
    var em = parms.em;
    if (cd && em) {
        if (cd.trim() !== "" && em.trim() !== "") {
            if (userVerify(cd, em)) {
                //window.location.href = "default.html";
            }
            $(".Error").html("There seems to be a problem verifying your registration.  If it has been more that 24 hours since you registered, the verification code sent you has expired, and you will have to go through the registration process again.");
        }
    }
    else {
        $(".Error").html("There seems to be a problem verifying your registration.  Please ensure that the URL you are using matches the verification URL which was emailed to you.");
    }
});