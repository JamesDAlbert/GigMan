"use strict";
$(document).ready(function () {

    var gnr = genres();
    var opts = "";
    for (var i = 0; i < gnr.length; i++) {
        $("#Genres").append("<option value='" + gnr[i].ID + "'>" + gnr[i].Name + "</option>");
    }


    $("#SaveArtist").click(function () {
        if ($("#ArtistName").val().trim() == "")
        {
            $(".error").css("color", "red");
            $(".error").text("Artist name is a required field.");
        }
        var found  = iRequestNameExists($("#iRequestName").val(),0);
        if (found) {
            $(".error").css("color", "red");
            $(".error").text("Sorry - thatGigMan Request name is already being used on GigMan. GigMan Request names must be unique.");
        }
        else {
            found = artistExists($("#ArtistName").val(), getUserID());
            if (found) {
                $(".error").css("color", "red");
                $(".error").text("You already own an Artist account with that name.");
            }
            else {

                var gnr = "";
                $('#Genres :selected').each(function (i, selected) {
                    gnr += $(selected).val() + ",";
                });
                if (gnr.indexOf(",") > -1)
                    gnr = gnr.replace(/,([^,]*)$/, '$1');

                var v = artistCreate($("#ArtistName").val(), $("#ArtistWebsite").val(), getUserID(), $("#ShowCategories").prop("checked"), $("#ShowArtist").prop("checked"), $("#ShowMembers").prop("checked"),
                    $("#Public").prop("checked"), $("#EnableDownvotes").prop("checked"), $("#maxMessages").val(), $("#maxRequests").val(), $("#iRequestName").val(), gnr, $("#offAirMessage").val());
                if (v && !v.Error) {
                    $(".error").css("color", "lime");
                    $(".error").text("Artist " + $("#ArtistName").val() + " has been successfully created.");
                    addSampleSong();
                    window.parent.document.getElementById("ArtistProfile").className = 'tile-content myTile';
                    var uls = useLocalStorage;
                    useLocalStorage = false;
                    artistAffiliations(getUserID());
                    useLocalStorage = uls;
                    parent.location.reload(false);
                }
                else {
                    $(".error").css("color", "red");
                    $(".error").text("There has been a problem creating your new artist.  Please wait a bit, then try again.  Please contact us if the problem persists");
                }
            }
        }
    });   
});



