var iRequestPoll = false;
var n;
var fetchType = "all";
var max = 0;
var pollTimer;
$(document).ready(function () {
    loadArtists();
    if (!pollTimer && iRequestPoll && isPremium())
        startTimer();

    $("#iRequestEnable").click(function () {
        iRequestPoll = $(this).prop("checked");
        if (iRequestPoll === true) {
            startTimer();
            getRequests();
        }
        else stopTimer();
    });
    $("#artistList").change(function () {
        var art = artistByID($("#artistList").val());
        setSession("activeartist", JSON.stringify(art));
        removeLocal("songlist");
        window.top.location.reload();
    });

    var dta;// = getRequestData(($("#requestDate").prop("checked")));
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
    $("#RequestLoadType input").on("click", function (e) {
        e.preventDefault();
        var t = $(this).val();
        setRequestLoadTypeSwitch(t);
    });
    $("#reqchart").css("width", "1000px");//parseInt($("#chartAccordion").css("width")) - 10 + "px");
    
    if (isPremium()) {
        getRequests();
        getMessages();
        getStats();
    }
    setRequestLoadTypeSwitch("all");
    var hh = $(".pageHeader").height() + 0;

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.hdrOffset { margin-top: ' + hh + 'px!important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    $(".rqContent").addClass('hdrOffset');
});



function setRequestLoadTypeSwitch(sch) {
    $("#RequestLoadType .slide-switch-label").removeClass("switch-selected");
    var ss = "css/gigman-";
    $("#RequestLoadType .slide-switch-marker").removeClass("slide-switch-marker-current");

    switch (sch) {
        case "all":
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-right");
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-middle");
            $("#RequestLoadType .slide-switch-selection").addClass("slide-switch-left");
            $("#RequestLoadType .slide-switch-label-left span").addClass("slide-switch-marker-current");
            break;
        case "today":
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-left");
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-right");
            $("#RequestLoadType .slide-switch-selection").addClass("slide-switch-middle");
            $("#RequestLoadType .slide-switch-label-left").addClass("switch-selected");
            $("#RequestLoadType .slide-switch-label-middle span").addClass("slide-switch-marker-current");
            break;
        case "live":
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-middle");
            $("#RequestLoadType .slide-switch-selection").removeClass("slide-switch-left");
            $("#RequestLoadType .slide-switch-selection").addClass("slide-switch-right");
            $("#RequestLoadType .slide-switch-label-left").addClass("switch-selected");
            $("#RequestLoadType .slide-switch-label-middle").addClass("switch-selected");
            $("#RequestLoadType .slide-switch-label-right span").addClass("slide-switch-marker-current");
            break;
    }
    fetchType = sch;
    getRequests(sch);
}


function getStats() {
    var aid = getActiveArtistID();
    if (!aid || aid.Error || aid < 1)
        return;
    var req = iRequestStats(aid);
    if (req.MessageTraffic.length == 0 && req.RequestTraffic.length == 0)
        return;
    $("#mostReq").text(getSongFromID(req.HiRequestID).Title + " (" + req.HiRequest + ")");
    $("#leastReq").text(getSongFromID(req.LoRequestID).Title + " (" + req.LoRequest + ")");
    $("#mostDV").text(getSongFromID(req.HiDownVoteID).Title + " (" + req.HiDownVote + ")");
    $("#leastDV").text(getSongFromID(req.LoDownVoteID).Title + " (" + req.LoDownVote + ")");
    $("#mostUV").text(getSongFromID(req.HiUpVoteID).Title + " (" + req.HiUpVote + ")");
    $("#leastUV").text(getSongFromID(req.LoUpVoteID).Title + " (" + req.LoUpVote + ")");
    var mx = jlinq.from(req.RequestTraffic).max("Count");
    var mn = jlinq.from(req.RequestTraffic).min("Count");
    $("#trafficReqHi").text(formatDate(mx.Date).replace("00:00", "") + " (" + mx.Count + ")");
    $("#trafficReqLo").text(formatDate(mn.Date).replace("00:00", "") + " (" + mn.Count + ")");
    mx = jlinq.from(req.MessageTraffic).max("Count");
    mn = jlinq.from(req.MessageTraffic).min("Count");
    $("#trafficMsgHi").text(formatDate(mx.Date).replace("00:00", "") + " (" + mx.Count + ")");
    $("#trafficMsgLo").text(formatDate(mn.Date).replace("00:00", "") + " (" + mn.Count + ")");

    graph(req);
}
function graph(dta) {
    
    var rlabels = [], rdat = [], mlabels = [], mdat = [];
    for (var i = 0; i < dta.RequestTraffic.length; i++) {
        rlabels.push(formatDate(dta.RequestTraffic[i].Date).replace("00:00", ""));
        rdat.push(dta.RequestTraffic[i].Count)
    }
    for (var i = 0; i < dta.MessageTraffic.length; i++) {
        mlabels.push(formatDate(dta.MessageTraffic[i].Date).replace("00:00", ""));
        mdat.push(dta.MessageTraffic[i].Count)
    }
    var lbls = mlabels.length > rlabels.length ? mlabels : rlabels;
    var data = {
        labels: lbls,
        datasets: [
            {
                label: "Request Traffic",
                fillColor: "transparent",
                strokeColor: "lime",
                pointColor: "rgb(255,0,255,255)",
                pointStrokeColor: "lime",
                pointHighlightFill: "lime",
                pointHighlightStroke: "lime",
                data: rdat
            },
            {
                label: "Message Traffic",
                fillColor: "transparent",
                strokeColor: "red",
                pointColor: "rgb(255,0,255,255)",
                pointStrokeColor: "red",
                pointHighlightFill: "red",
                pointHighlightStroke: "red",
                data: mdat
            }
        ]
    };
    var ctx = document.getElementById("reqchart").getContext("2d");
    ctx.canvas.width = parseInt($("#chartAccordion").css("width"))- 10;
    ctx.canvas.height = 400;
    var myNewChart = new Chart(ctx).Line(data, {
        bezierCurve: false,
        scaleFontColor: "white",
        scaleColor: "white",
        scaleLineColor: "white",
        showTooltips: true,
        multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
        animation: true
    });
}
function startTimer() {
    pollTimer = window.setInterval(function () {
        resetMessageData();
        resetRequestData();
        resetStats();
    }, 10000);
}
function stopTimer() {
    clearInterval(pollTimer);
}
function getRequests(type) {
    var dta = getRequestData(type);
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
    var ms = iRequestMessages(getUserID(), getActiveArtistID(), $("#messageDate").prop("checked") ? 1 : 0);
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
        if (!ms[i].Message.trim()) ms[i].Message = "<i style='color:gray'>No personal message found.</i>";
        out += "<tr class='messageData' style='width:75%!important'><td class='messageData'>" + ms[i].Message + "</td><td class='messageAttachment'>" + lnk + "</td>" +
            "<td style='white-space:nowrap' style='padding-right:3px'>" + tm + "<a href='#' class='messageDelete' data-messageid='" + ms[i].ID + "' title='Delete message.'><span class='mif-cross'></span></a></td></tr>";
    }
    $("#messageList > tbody").html(out);
    $("#messageCount").text(ms.length);

}
function formatDate(jDt) {
    var tdate = eval("new " + jDt.replace("/", "").replace("/", "").substring(0, jDt.indexOf("-") - 1) + ")");
    var date = (tdate.getMonth() + 1) + "/" + tdate.getDate() + "/" + tdate.getFullYear();// + " " + pad(tdate.getHours()) + ":" + pad(tdate.getMinutes());
    return date;
}
function resetStats() {
    getStats();
}
function resetMessageData(reqLst, dta) {
    var dta = getMessageData(($("#messageDate").prop("checked")));
    $("#messageList > tbody").html("");
    getMessages();
}
function resetRequestData(reqLst, dta) {
    var dta = getRequestData(fetchType);
    if (!dta || dta.Error)
        return;
    $("#requestList").dataTable().fnClearTable();
    if (dta.length > 0)
        $("#requestList").dataTable().fnAddData(dta);
}
function getMessageData(today) {
    if (today == null)
        today = false;
    var aid = getActiveArtistID();
    if (!aid || aid.Error || aid < 1)
        return;
    var dta = iRequestMessages(getUserID(), aid, today);
    if (dta.length > 0) {
        $(".mif-menu").addClass("blink");
        max = jlinq.from(dta).max("MessageCount").RequestCount;
        $("#messageCount").text(dta.length);
    }
    return dta;
}
function getRequestData(type) {
    if (type == null)
        type = "all";
    var dta;
    var aid = getActiveArtistID();
    if (!aid || aid.Error || aid < 1)
        return;
    if (type != "live")
        dta = iRequests(aid, type == "today");
    else dta = iRequestsLive(getActiveArtistID());
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