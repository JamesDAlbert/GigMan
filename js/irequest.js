
$(document).ready(function () {
    var songList = null;
    var band = document.location.toString();
    band = band.replace("#", "");
    var artistMap = null;
    var disableRequests = false, disableMessages = false;
    if (band.indexOf(".html") < 0) {
        band = decodeURI(band.substring(band.lastIndexOf("/") + 1));
        $("#calendarLink").prop("title", band + "'s Calendar");
        $("#otherCharm").data("charm").open();
        loadContent("about.html");
        $("#aboutLink").addClass("emphasis");
        artistMap = artistByiRequestName(band);
        if (!artistMap.iRequestMember)
        {
            loadContent("notfound.html");
            sessionStorage.setItem("band", artistMap.ArtistName);
            disableActiveLinks();
        }
        if (!artistMap.PremiumMember)
            disableCalendarLink();
        if (artistMap.UserID == -1 || band == "" || artistMap.UserID == undefined) {
            artistMap = null;
            disableRequests = disableMessages = true;
            sessionStorage.setItem("band", band);
            $("#otherCharm").data("charm").open();
            document.getElementById("contentContainer").src = "notfound.html";
            $("#contentContainer").show();
            $(".toHide").hide();
        }
        if (artistMap != null) {
            sessionStorage.setItem("artist", JSON.stringify(artistMap));
            if (band.indexOf(".htm") > 0) {
                if (band.indexOf("/") < 0) {
                    cmd = band.substring(0, band.indexOf(".htm"));
                    document.getElementById("contentContainer").src = "" + cmd;
                    $("#contentContainer").show();
                }
            }
            if (artistMap.Website != "")
                $(".bandName")[0].innerHTML = "<a href='" + artistMap.Website + "' target='_blank'>" + artistMap.ArtistName + "</a><span class='headerTitle'>'s</span>";
            else $(".bandName").text("<span class='headerTitle'>" + band + "'s</span>");
            var dta = songListPublic(artistMap.ArtistID);
            if (dta.length == 0) {
                $("#otherCharm").data("charm").open();
                document.getElementById("contentContainer").src = "nodata.html";
                disableRequests = true;
                $("#requestLink").css("text-decoration", "none");
            }
            else $("#intro").show();            
        }       
    }
    $("#bandName").text(sessionStorage.getItem("band"));
    $("#aboutLink").click(function () {
        openCharm("requestCharm", false);
        openCharm("messageCharm", false);
        loadContent("about.html");
        
        $(".contentLink").removeClass("emphasis");
        $(this).addClass("emphasis");
        openCharm("otherCharm", true);
    });
    $("#calendarLink").click(function () {
        openCharm("requestCharm", false);
        openCharm("messageCharm", false);
        loadContent("reqcalendar.html");
        
        $(".contentLink").removeClass("emphasis");
        $(this).addClass("emphasis");
        openCharm("otherCharm", true);
    });
    $("#tutorialLink").click(function () {
        openCharm("requestCharm", false);
        openCharm("messageCharm", false);
        loadContent("tutorial.html");
        
        $(".contentLink").removeClass("emphasis");
        $(this).addClass("emphasis");
        openCharm("otherCharm", true);
    });
    $("#requestLink").click(function () {
        if (disableRequests)
            return;
        openCharm("otherCharm", false);
        openCharm("messageCharm", false);
        $(".contentLink").removeClass("emphasis");
        $(this).addClass("emphasis");
        openCharm("requestCharm", true);
        $('#requests').attr('src', function (i, val) {
            return val;
        });
    });
    $("#messageLink").click(function () {
        if (disableMessages)
            return;
        openCharm("otherCharm", false);
        openCharm("requestCharm", false);
        $(".contentLink").removeClass("emphasis");
        $(this).addClass("emphasis");
        openCharm("messageCharm", true);
        $('#iframe').attr('src', function (i, val) { return val; });
    });

    $("#interfaceLink").click(function () {
        loadInterface();
    });
    $("#continueLink").click(function () {
        $("#interface").show();
        $("#flowLinkContainer").hide();
    });
    

    $("#interface").show();

    $(".requestContainer").click(function () {
        $(".requestContainer").removeClass("selectedRequest");
        $(".requestLabel").removeClass("requestLabelSelected");
        $(".request").removeClass("requestSelected");
        $(".requestSong").removeClass("requestSongSelected");
        $(".songVote").removeClass("songVoteSelected");
        $(this).addClass("selectedRequest");
        $(this).find(".request").addClass("requestSelected");
        $(this).find(".requestSong").addClass("requestSongSelected");
        $(this).find(".requestLabel").addClass("requestLabelSelected");
        $(this).find(".songVote").addClass("songVoteSelected");
    });

    $(document).on("click", ".songDownVoteLink", function () {
        var art = unescape(decodeURI($(this).data("artist"))), ttl = unescape(decodeURI($(this).data("title")));
        if (foundRequest(ttl + "/" + art))
        { $("#message").text("You can only request a song once."); return; }
        $("#message").text("");
        $(".selectedRequest .songVote").removeClass("mif-thumbs-up").addClass("mif-thumbs-down");
        $(".selectedRequest .requestSongSelected").text(ttl + "/" + art);
        $(".selectedRequest").data("id", $(this).data("id"));
        $(".selectedRequest").data("vote", -1);
        selectNext();
    });
    $(document).on("click", ".songUpVoteLink", function () {
        var art = unescape(decodeURI($(this).data("artist"))), ttl = unescape(decodeURI($(this).data("title")));
        if (foundRequest(ttl + "/" + art))
        { $("#message").text("You can only request a song once."); return; }
        $("#message").text("");
        $(".selectedRequest .songVote").removeClass("mif-thumbs-down").addClass("mif-thumbs-up");
        $(".selectedRequest .requestSong").text(ttl + "/" + art);
        $(".selectedRequest .requestSong").data("id", $(this).data("id"));
        $(".selectedRequest").data("id", $(this).data("id"));
        $(".selectedRequest").data("vote", 1);
        selectNext();
    });
    var w = $("#interface").css("width");
    var inw = $(document).innerWidth();

    $(".charm").css("margin-top", $(".header").height());

    $("#themeSwitch").click(function () {
        alert("!");
    });
    
});
function disableCalendarLink()
{
    $("#calendarLink").hide();
}
function disableActiveLinks(art) {
    $("#messageLink").hide();
    $("#requestLink").hide();
}

function openCharm(charmID, open)
{
    var ch = $("#" + charmID).data("charm");
    if (open && !ch.element.data("opened") === true)
        ch.open();
    else if (ch.element.data("opened") === true && !open)
        ch.close();
}
function addRegistry(art, key, numToAdd) {
    var found = false;
    var ir = sessionStorage.getItem(key);

    var ary = [];
    if (ir != null) ary = JSON.parse(ir);
    for (var i = 0; i < ary.length; i++) {
        if (ary[i].Artist == art) {
            if (ary[i].Date < (Date.now() - (24 * 60 * 60 * 1000))) {
                array.slice(ary, i);
            }
            else found = true;
            break;
        }
    }
    for (var i = 0; i < numToAdd; i++)
        ary.push({ Date: Date.now(), Artist: art });
    if (ary && ary.length > 0) {
        sessionStorage.setItem(key, JSON.stringify(ary));
    }
    return !found;
} var ret = false;
function checkRegistry(art,key,max) {
    var s = sessionStorage.getItem(key);
    var ret = false;
    var found = false;
    var count = 0;
    if (s != null) {
        var ary = JSON.parse(s);
        for (var i = 0; i < ary.length; i++) {
            if (ary[i].Artist == art) {
                found = true;
                if (ary[i].Date < (Date.now() - (24 * 60 * 60 * 1000)))
                    ret = true;
                else count++;
            }
        }
    }
    return count;
}
function foundRequest(cur) {
    var text = cur;
    var found = false;
    $.each($(".requestContainer"), function (index, value) {
        if ($(value).hasClass("selectedRequest")) {
        }
        else {
            if ($(value).find(".requestSong").text() == text)
                found = true;
        }
    });
    return found;
}
function selectNext() {
    $(".requestContainer").removeClass("selectedRequest");
    $.each($(".requestContainer"), function (index, value) {
        if ($(value).find(".requestSong").text().trim() == "")
        {            
            $(".requestContainer").removeClass("selectedRequest");
            $(".requestLabel").removeClass("requestLabelSelected");
            $(".request").removeClass("requestSelected");
            $(".requestSong").removeClass("requestSongSelected");
            $(".songVote").removeClass("songVoteSelected");
            $(value).addClass("selectedRequest");
            $(value).find(".request").addClass("requestSelected");
            $(value).find(".requestSong").addClass("requestSongSelected");
            $(value).find(".requestLabel").addClass("requestLabelSelected");
            $(value).find(".songVote").addClass("songVoteSelected");
            return false;
        }
    });
}

function loadInterface()
{
    $("#interface").show();
    $("#contentContainer").hide();
    $("#tutorialLink").show();
    $("#interfaceLink").hide();
    $("#Welcome").show();
    $("#Title").hide();
    $("#message").show();
    document.getElementById("contentContainer").src = "";
}
function loadContent(content)
{
    document.getElementById("contentContainer").src = content;
}