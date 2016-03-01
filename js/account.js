"use strict";
$(document).ready(function () {
    "use strict";
    checkLoginStatus();
    if (getSession("activeartist") == null)
        $("#ArtistProfile").addClass("disabled");
    $(document).on("click", ".tile-content", function () {
        var charm;
        switch ($(this).attr("id")) {
            case "Logout":
                var ip = getClientIP(), userID = getUserID(), data = getSessionData(), userAgent = navigator.userAgent;
                saveUserSession(userID, ip, data, userAgent);
                clearSession();
                window.location.href = "default.html"
                break;
            case "Profile":
                charm = $("#profileCharm").data("charm");
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
            case "ArtistProfile":
                charm = $("#artistProfileCharm").data("charm");
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
            case "UserSettings":
                charm = $("#settingsCharm").data("charm");
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
            case "NewArtist":
                charm = $("#newArtistCharm").data("charm");
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
        }

    });

    $("#CloseProfilePanel").click(function () {
        var charm = $("#profileCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        }
    });
    $("#CloseArtistProfilePanel").click(function () {
        var charm = $("#artistProfileCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        }
    });
    $("#CloseNewArtistPanel").click(function () {
        var charm = $("#newArtistCharm").data("charm");
        if (charm.element.data("opened") === true) {
            charm.close();
        }
    });
    var hh = $(".indexHeader").height();
    $("#profilePage").css("margin-top", hh+"px");
});


