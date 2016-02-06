"use strict";
$(document).ready(function () {
    $("#WantAds").click(function () {
        window.location.href = "wantads.html";
    });
     $("#FAQ").click(function () {
        window.location.href = "faq.html";
    });   
    $("#loginLink").click(function () {
        var charm = $("#loginCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $("#createAccount").click(function () {
        var charm = $("#createAccountCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $("#CloseLoginPanel").click(function () {
        var charm = $("#loginCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });
    $("#CloseCreateAccountPanel").click(function () {
        var charm = $("#createAccountCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        } else {
            charm.open();
        }
    });

});