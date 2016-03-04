var ipAddress = "";
ipAddress = getClientIP();
var counts;
var art = JSON.parse(getSession("artist"));

var sdta = songListPublic(art.ArtistID);
var counts = getCountFromIP(ipAddress, art.ArtistID + "");

var curRequest = "";
var cs = getSession("gmrcolorscheme");
if (!cs) cs = "classic";
$("#gmrStyle").prop("href", "css/request-" + cs  + ".min.css");

$(document).ready(function () {
    if (art.iRequestName == "info")
        return;
    if (!art.RequestStatus) {
        if (art.OffAirMessage && art.OffAirMessage.trim() != "")
            $(".content").html(art.OffAirMessage);
        else $(".content").html(art.ArtistName + " is offline right now.  You can try their calendar or announcements pages to see whjen they will be back.");

        $("#reqPanel").hide();

        $(".frame").addClass("active");
        return;
    }
    else {
        $("#helpOpener").show();
        $("#reqPanel").show();
    }

    $(".request").click(function (e) {
        e.stopPropagation();
        $(".request").removeClass("selectedRequest");
        curRequest = $(this)[0].id;
        $(this).toggleClass("selectedRequest");
    });
    $(".voteLink").click(function (e) {
        e.stopPropagation();
        if ($(this).hasClass("disabled"))
            return;
        if ($(this).hasClass("upVote")) {
            $(this).parent().parent().removeClass("downVoted");
            $(this).removeClass("inactive");
            $(this).addClass("active");
            $(this).parent().parent().addClass("upVoted");
            $(this).closest(".requestHeader").find(".downVote").addClass("inactive").removeClass("active");
            $(this).parent().parent().data("vote", "1");
        }
        else {
            $(this).parent().parent().removeClass("upVoted");
            $(this).removeClass("inactive");
            $(this).parent().parent().addClass("downVoted");
            $(this).addClass("active");
            $(this).closest(".requestHeader").find(".upVote").addClass("inactive").removeClass("active");
            $(this).parent().parent().data("vote", "-1");
        }
        $(this).parent().parent().removeClass("selectedRequest");
    });
    $(".removeRequest").click(function () {
        $(this).parent().parent().removeClass("upVoted");
        $(this).parent().parent().removeClass("downVoted");
        $(this).parent().children(".requestText").text("");

        if ($(this).parent().parent().hasClass("selectedRequest"))
            curRequest = "";
        $(".request").removeClass("selectedRequest");
    });
    $(document).on("click", ".songLinkA", function (e) {
        e.preventDefault();
        if ($(this).hasClass("disabled")) return;
        setMessage("");
        if (!selected($(this).data("songid")))
            addRequest(art, $(this).data("songid"), $(this).data("text"));
        else setMessage("One request per song per 24-hour period.");
    });

    if (sdta.length == 0) {
        parent.showContent("#otherCharm", "gmrnodata.html", true)
        disableRequests = true;
    }
    $("#requestWrapper").show();
    songList = $('#SongList').DataTable({
        "aaData": sdta,
        orderClasses: true,
        "sDom": "f<'toolbar'>t",
        paging: false,
        responsive: true,
        "bAutoWidth": true,
        fixedHeader: true,
        "sScrollX": "100%",
        "sScrollY": "300px",
        "bScrollAutoCss": false,
        "oLanguage":
        {
            "sSearch": "",
            searchPlaceholder: "Start typing...",
            "sEmptyTable": "There are no songs to show!"
        },
        "columnDefs": [

        {
            "orderable": true, "width": "33%", "targets": 0, "render": function (value, type, full) {
                return "<div class='songLinkA' data-text='" + escape(encodeURI(full.Title + ": " + full.Artist)) + "' data-songid='" + escape(full.ID) + "'>" + full.Title + "</div>";
            }
        },
        {
            "orderable": true, "width": "33%", "targets": 1, "render": function (value, type, full) {
                return "<div class='songLinkA' data-text='" + escape(encodeURI(full.Title + ": " + full.Artist)) + "' data-songid='" + escape(full.ID) + "'>" + full.Artist + "</div>";
            }
        },
        {
            "orderable": true, "width": "33%", "targets": 2, "render": function (value, type, full) {
                return "<div class='songLinkA' data-text='" + escape(encodeURI(full.Title + ": " + full.Artist)) + "' data-songid='" + escape(full.ID) + "'>" + full.Category + "</div>";
            }
        },
        ]
    });
    $('.dataTables_filter input').attr("placeholder", "Enter seach term here");
    $('.dataTables_filter input').css({ "font-size": "16px", "width": "170px", "margin-right": "0", "margin-bottom": "-20px" });

    $("div.toolbar").html('<button class="button small-button" id="submitButton"><span class="mif-checkmark"></span> Done!</button>').css({ "margin-top": "0", "width": "150px", "margin-bottom": "-66px" });
    $(document).on("click", "#submitButton", function (e) {
        e.stopPropagation();
        counts = getCountFromIP(ipAddress, art.ArtistID + "");
        if (counts.Songs.length >= art.MaxiRequests) {
            $(this).addClass("disabled");
        }
        if ($(this).hasClass("disabled"))
            return;
        var found = false, vFound = true;
        var nFound = 0;
        $(".request").each(function (i, value) {
            var s = $(value).find(".requestText")[0].innerText;
            var weight = 1;
            if (!$(this).data("vote") && art.EnableDownvotes)
                vFound = false;
            else weight = $(this).data("vote");
            if (s.trim() != "" && !$(value).hasClass("disabled") && $(value).is(":visible")) {
                $(value).hide();
                iRequestCreate(art.ArtistID, $(this).data("songid"), weight, ipAddress);
                found = true;
                nFound++;
            }
        });
        if (!found) {
            $("#Message").text("No new requests to send!");
        }
        if (!vFound) {
            $("#Message").text("You have made selections, but have not given the selections a vote.");
        }
        var msg = "";
        if (nFound >= art.MaxiRequests) {
            for (var i = 0; i <= nFound; i++)
                $("#request" + i).show();
            $(".removeRequest").hide();
            $(".outerTableWrapper").hide();
            msg += "Come back tomorrow to make more requests!";
        }
        $("#Message").text(art.ArtistName + " thanks you for using GigMan Request! " + msg);
    });

    adjustView(art);
});
function selected(id) {
    var i = 1;
    for (i = 1; i < 6; i++) {
        var r = $("#request" + i);
        if (r.css("display") != "none") {
            if (r.data("songid") == id)
                return true;
        }
    }
    return false;
}
function setMessage(msg) {
    $("#Message").text(msg);
}

function adjustView(art) {
    counts = getCountFromIP(ipAddress, art.ArtistID + "");
    if (counts.Songs.length >= art.MaxiRequests)
        $("#submitButton").hide();
    if (!art.EnableDownvotes) {
        $("a.vote").removeClass("mif-thumbs-up").removeClass("mif-thumbs-down").removeClass("voteLink");
    }
    var c = 0;
    if (counts) {
        if (counts.Songs.length >= art.MaxiRequests) {
            $("#submitButton").addClass("disabled").hide();
            $("#Message").text("You have made the maximum number of requests to " + art.ArtistName + " for today.");
            $(".songLinkA").addClass("disabled");
            $(".outerTableWrapper").hide();
        }
        for (var i = 0; i < counts.Songs.length; i++) {
            var s = jlinq.from(sdta).equals("ID", counts.Songs[i].SongID).select()[0];

            var reqID = addRequest(art, s.ID, s.Title + ": " + s.Artist, counts.Songs[i].Weight);
            $(reqID).find(".removeRequest").hide(); // don't let user remove previous requests
            $(reqID).find(".vote").addClass("disabled");
            $(reqID).addClass("disabled");
        }
    }

    for (var i = (art.MaxiRequests + 1) - c; i < 6; i++) {
        $("#request" + i).hide();
    }
    if (!art.ShowCategories)
        songList.column(2).visible(false);
    if (!art.ShowArtist)
        songList.column(1).visible(false);
}

function addRequest(art, songID, ttl, weight) {
    if (!curRequest || curRequest == "") {
        reqID = getFirstEmptyRequest();
    }
    else reqID = curRequest;

    $("#" + reqID).data("songid", songID);
    $("#" + reqID + " .requestText").text(unescape(decodeURI(ttl)));
    $("#" + reqID + " .requestText").prop("title", unescape(decodeURI(ttl)));

    if (!art.EnableDownvotes || weight) {
        var wgt = weight ? weight : 1;
        $("#" + reqID).data("vote", wgt);
        if (wgt > 0) {
            $("#" + reqID + " .upVote").addClass("upVoted").addClass("active");
            $("#" + reqID + " .downVote").removeClass("upVoted").removeClass("downVoted").addClass("inactive").removeClass("active");
        }
        else if (wgt < 0) {
            $("#" + reqID + " .downVote").addClass("downVoted").addClass("active");
            $("#" + reqID + " .upVote").removeClass("downVoted").removeClass("upVoted").addClass("inactive").removeClass("active");

        }
    }
    return "#" + reqID;
}
function getFirstEmptyRequest() {
    var i = 1;
    for (i = 1; i < 6; i++) {
        var r = $("#request" + i);
        if (r.css("display") != "none" && !r.hasClass("disabled")) {
            if (r.find(".requestText").text().trim() == "")
                break;
        }
    }
    if (i <= art.MaxiRequests)
        return "request" + i;
    else return "request" + art.MaxiRequests;
}