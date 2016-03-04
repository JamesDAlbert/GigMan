"use strict";
var iRequestPoll = false;
var n;

var max = 0;
var pollTimer;
$(document).ready(function () {
    n = getMasterSongList().length;
    loadArtists();
    $("#SongCount").text("(" + n + ")");
    $("#iRequestLink").prop("href", iRequestURL);
    $("#iMessageLink").prop("href", iRequestURL);
    $("#clearAllMessages").data("userid", getUserID());
    $("#iRequestEnable").prop("checked", iRequestPoll);
    if (getLocal("dirty"))
        $(".mif-redo").addClass("blink");
    else $(".mif-redo").removeClass("blink");
    if (!pollTimer && iRequestPoll && isPremium())
        startTimer();
    if (iRequestPoll && isPremium()) {
        getRequests();
        getMessages();
    }
    $("#iRequestEnable").click(function () {
        iRequestPoll = $(this).prop("checked");
        if (iRequestPoll === true) {
            startTimer();
            getRequests();
        }
        else stopTimer();
    });
    var art = JSON.parse(getSession("activeartist"));
    if (art.RequestStatus)
    {
        $(".warning").hide();
    }
    else
    {
        $(".warning").show();
    }
    $("#artistList").change(function () {
        art = artistByID($("#artistList").val());   
        setSession("activeartist", JSON.stringify(art));
        removeLocal("songlist");
        window.top.location.reload();
    });

    $("#messageDate").change(function () {
        resetMessageData();
    });

    $("#requestDate").change(function () {
        resetRequestData();
    });
    var dta = getRequestData(($("#requestDate").prop("checked")));

    var reqLst = $("#requestList").dataTable({
        "data": dta,
        "filter": false,
        "paging": false,
        "ordering": true,
        "info": false,
        "fixedHeaders": true,
        "language": {
            "emptyTable": "No requests yet"
        },
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            var uv = aData.UpVotes, dv = aData.DownVotes;
            var ur = (uv * 1.0) / (uv + dv),
                dr = (ur * 1.0) / (uv + dv);
            if (aData.RequestCount == max)
                $(nRow).addClass("maxRequest");
            if (dv > uv)
                $(nRow).addClass("redRow");
            if (uv > dv && (((uv * 1.0) / (uv + dv * 1.0) > 0.65)))
                $(nRow).addClass("greenRow");
            else if (uv > dv && (((uv * 1.0) / (uv + dv * 1.0) <= 0.65)) || (uv == dv))
                $(nRow).addClass("yellowRow");
        },
        "columnDefs": [
            {
                "bSortable": true, "aTargets": 0, "mRender": function (value, type, full) {
                    return "<a class='songLink' href='#' data-songid='" + full.SongID + "' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "' data-title='" + full.Title + "'>" + full.Title + "</a>";
                }
            },
            {
                "bSortable": true, "aTargets": 1, "mRender": function (value, type, full) {
                    return "<a class='artistLink' href='#' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "'>" + full.Artist + "</a>";
                }
            },
            {
                "bSortable": true, "aTargets": 2, "mRender": function (value, type, full) {
                    return "<span style='font-weight:bold;font-style:italic'>" + full.RequestCount + "</span>";
                }
            },
            {
                "bSortable": true, "aTargets": 3, "mRender": function (value, type, full) {
                    return full.UpVotes;
                }
            },
            {
                "bSortable": true, "aTargets": 4, "mRender": function (value, type, full) {
                    return full.DownVotes;
                }
            }
        ],

    });
});
function startTimer() {
    pollTimer = window.setInterval(function () {
        resetMessageData();
        resetRequestData();
    }, 10000);
}
function stopTimer() {
    clearInterval(pollTimer);
}
function getRequests() {
    var dta = getRequestData(($("#requestDate").prop("checked")));
    if (!dta || dta.Error)
        return;
    $("#requestAccordion").css("color", "inherit");
    if (dta.length > 0) {
        $(".mif-menu", window.parent.document).addClass("blink");
        $("#requestAccordion").css("color", "orange");
    }
    $("#requestList").dataTable().fnClearTable();
    if (dta.length > 0)
        $("#requestList").dataTable().fnAddData(dta);

}

function getMessages() {
    var aid = getActiveArtistID();
    if (!aid || aid < 1)
        return;
    var ms = iRequestMessages(getUserID(aid), aid, $("#messageDate").prop("checked") ? 1 : 0);
    if (ms.Error || ms.length < 1)
        return;
    if (ms.length < 1)
        return;
    var hdg = ms[0].Heading;
    var date = formatDate(ms[0].MessageDate);
    var out = "<tr><td colspan='3' class='messageDate'>" + date + "</td></tr>";
    out += "<tr><td colspan='3' class='messageHeading'><b>" + hdg + "</b></td></tr>";

    for (var i = 0; i < ms.length; i++) {
        var dt = formatDate(ms[i].MessageDate);
        if (dt.substring(0, dt.indexOf(" ")) != date.substring(0, date.indexOf(" "))) {
            date = dt;
            out += "<tr><td colspan='3' class='messageDate'>" + date + "</td></tr>";
        }
        if (ms[i].Heading != hdg) {
            hdg = ms[i].Heading;
            out += "<tr><td colspan='3' class='messageHeading'><b>" + hdg + "</b></td></tr>";
        }
        var lnk = "";
        var tm = dt.substring(dt.indexOf(" "));
        if (ms[i].Attachment && ms[i].Attachment != "")
            lnk = "<a class='attachment' href='uploads/" + ms[i].Attachment + "' title='Click to view attachment in a new window.' target='_new'><span class='mif-attachment'></span></a>";
        out += "<tr class='messageData' style='width:75%!important'><td class='messageData'>" + ms[i].Message + "</td><td class='messageAttachment'>" + lnk + "</td>" +
            "<td style='white-space:nowrap' style='padding-right:3px'>" + tm + "<a href='#' class='messageDelete' data-messageid='" + ms[i].ID + "' title='Delete message.'><span class='mif-cross'></span></a></td></tr>";
    }
    $("#messageList > tbody").html(out);
    $("#messageCount").text(ms.length);

}
function formatDate(jDt) {
    var tdate = eval("new " + jDt.replace("/", "").replace("/", "").substring(0, jDt.indexOf("-") - 1) + ")");
    var date = (tdate.getMonth() + 1) + "/" + tdate.getDate() + "/" + tdate.getFullYear() + " " + pad(tdate.getHours()) + ":" + pad(tdate.getMinutes());
    return date;
}

function resetMessageData(reqLst, dta) {
    var dta = getMessageData(($("#messageDate").prop("checked")));
    $("#messageList > tbody").html("");
    getMessages();
}
function resetRequestData(reqLst, dta) {
    var dta = getRequestData(($("#requestDate").prop("checked")));
    if (!dta)
        return;
    $("#requestList").dataTable().fnClearTable();
    if (dta.length > 0)
        $("#requestList").dataTable().fnAddData(dta);
}
function getMessageData(today) {
    if (today == null)
        today = false;
    var aid = getActiveArtistID();
    if (!aid || aid < 1)
        return;
    var dta = iRequestMessages(getUserID(), aid, today);
    if (dta.length > 0) {
        $(".mif-menu").addClass("blink");
        max = jlinq.from(dta).max("MessageCount").RequestCount;
        $("#messageCount").text(dta.length);
    }
    return dta;
}
function getRequestData(today) {
    if (today == null)
        today = false;
    var aid = getActiveArtistID();
    if (!aid || aid < 1)
        return;
    var dta = iRequests(aid, today);
    if (!dta || dta.Error)
        return;
    if (dta.length > 0) {
        $(".mif-menu").addClass("blink");
        max = jlinq.from(dta).max("RequestCount").RequestCount;
        dta = jlinq.from(dta).sort("RequestCount", "UpVotes", "DownVotes").select();
        $("#requestCount").text(dta.length);
    }
    return dta;
}
function loadArtists() {
    var arts = artistListByUserID(getUserID());
    for (var i = 0; i < arts.length; i++) {
        var o = "<option value='" + arts[i].ArtistID + "'>" + arts[i].ArtistName + "</option>";
        $("#artistList").append(o);
    }
    $("#artistList").val(getActiveArtistID());
}