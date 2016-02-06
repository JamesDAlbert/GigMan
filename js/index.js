"use strict";
$(document).ready(function () {
    var art = JSON.parse(getSession("activeartist"));
    var prem = false, ireq = false;;
    if (art && art.Artist) {
        prem = art.Artist.PremiumMember;
        ireq = art.Artist.iRequestMember;
    }
    else if (art) {
        prem = art.PremiumMember;
        ireq = art.iRequestMember;
    }
    else {
        $("#SongEditor").addClass("disabled");
    }
    if (art && art.Artist)
        $("#artistList").val(art.Artist.ArtistID);
    else if (art)
        $("#artistList").val(art.ArtistID);
    var usr = JSON.parse(getSession("loggedinuser"));
    if (usr)
    {
        $("#userName").text(usr.Username);
    }
    addressPremium(prem,ireq);
    
    if (getLocal("dirty"))
        $(".mif-redo").addClass("blink");
    else $(".mif-redo").removeClass("blink");
    var scheme = getSession("colorscheme");
    if (scheme == "highcontrast")
        $("#colorScheme").prop("checked", true);
    var n = getMasterSongList().length;
    $("#SongCount").text("(" + n + ")");

    $("#artistList").change(function () {
        var art = artistByID($("#artistList").val());
        setSession("activeartist", JSON.stringify(art));
        removeLocal("songlist");
        window.top.location.reload();
    });
    loadArtists();
});
function loadArtists() {
    var uid = getUserID();
    if (!uid || uid.Error)
        return;
    var arts = artistListByUserID(uid);
    for (var i = 0; i < arts.length; i++) {
        var o = "<option value='" + arts[i].ArtistID + "'>" + arts[i].ArtistName + "</option>";
        $("#artistList").append(o);
    }
    $("#artistList").val(getActiveArtistID());
}

function addressPremium(premium, ireq)
{
    if (!premium) {
        $("#Resynch").addClass("disabled");
        $("#Calendar").addClass("disabled");
        $("#Dashboard").addClass("disabled");
    }
    else {
        $("#Resynch").removeClass("disabled");
        $("#Calendar").removeClass("disabled");
    }
    if (ireq)
    {
        $("#Requests").removeClass("disabled");
    }
    else {
        $("#Requests").addClass("disabled");
    }
}