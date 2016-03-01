"use strict";
$(document).ready(function () {

    var art = JSON.parse(getSession("activeartist"));
    var usr = JSON.parse(getSession("loggedinuser"));
    setEventVisibilitySwitch("0");
    if ((art.Artist && !art.Artist.PremiumMember) || (!art.Artist && !art.PremiumMember))
    {
       window.location.href = document.referrer;
    }
    $("#colorScheme").prop("checked", getSession("colorscheme") == "highcontrast");
    $("#eventDate").datepicker();
    $("#calendar > table").addClass("gm-bg");
    $(".calendar-dropdown").addClass("gm-bg");
    $(".calendar-header").addClass("gm-bg");

    var data = calendarList(getUserID(), getActiveArtistID());
    var dta = mapEvents(data);


    $("#setupTime").timepicker();
    $("#startTime").timepicker();
    $("#endTime").timepicker();

    $('#calendar').fullCalendar({
        header: {
            right: 'basicWeek,basicDay,next',
            center: 'title',
            left: 'prev,today,month'
        },
        displyEventTime: false,
        selectable: true,
        selectHelper: true,
        select: function (start, end) {
            $("#eventDate").val(start.year() + "-" + pad(start.month() + 1) + "-" + pad(start.date()));
            $("#eventDatePicker").data("preset", start.year() + "-" + pad(start.month() + 1) + "-" + pad(start.date()));
            $("#calendarID").val("0");
            clearEditor();
            checkForOwnership(getUserID(), getUserID());
            var charm = $("#eventCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
            $('#calendar').fullCalendar('unselect');
        },
        eventDrop: function(event, delta, revertFunc) {

            if (!confirm("Move " + event.title + "?")) {
                revertFunc();
            }
            else
            {
                calendarShift(event._id, delta._days);
            }
        },
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: dta,
        eventRender: function (event, element) {
            return eventElement(event);
        }
    });
    $("#closeCharm").click(function () {
        var charm = $("#eventCharm").data("charm");
        if (charm.element.data("opened") === true)
            charm.close();
    });
    $("#Submit").click(function () {
        if ($("#Venue").val().trim() == "" || $("#eventDate").val() == "") {
            $("#error").text("Event date and Venue are required fields.");
            return;
        }
        var dt, st, et, sut, id, notes = "", desc = "", url = "", ven = "", vis;
        dt = $("#eventDate").val().split(" ")[0];
        st = dt + " " + $("#startTime").val();
        et = dt + " " + $("#endTime").val();
        sut = dt + " " + $("#setupTime").val();
        id = $("#calendarID").val();
        notes = scrub($("textarea#notes").val());
        desc = scrub($("textarea#description").val());
        url = scrub($("#URL").val());
        ven = scrub($("#Venue").val());
        vis = $("#EventVisibility").data("evtvisibility");//$("input[type='radio'][name='vis']:checked").val();
        if (!calendarSave(id, getUserID(), getActiveArtistID(), dt, ven, sut, st, et,
            $("#sets").val(), url, vis, notes, desc).Error)
            window.location.reload();
        else $("#error").text("There was an error saving your event.  Please try again later.  If the problem persists, please contact us.");
    });
    $(document).on("click", ".eventDeleteButton", function () {
        if (!confirm("Delete " + $(this).data("title") + "?"))
            return;
        calendarDelete(getUserID(), getActiveArtistID(), $(this).data("id"));
        $('#calendar').fullCalendar('removeEvents',$(this).data("id"));
    });
    $(document).on("click", ".gmEvent, .gmEventDisabled", function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var dat = null;
        for (var i = 0; i < data.length; i++)
            if (data[i].CalendarID == id) {
                dat = data[i];
            }
        if (dat) {
            checkForOwnership(getUserID(), dat.UserID);
            $("#eventDate").val(dat.Date);
            $("#Venue").val(dat.Venue);
            if (dat.SetupTime) $("#setupTime").val(dat.SetupTime.split(" ")[1]);
            $("#startTime").val(dat.StartTime.split(" ")[1]);
            $("#endTime").val(dat.EndTime.split(" ")[1]);
            $("#sets").val(dat.Sets);
            $("#URL").val(dat.URL);
            $("#calendarID").val(dat.CalendarID);
            $("#notes").text(dat.Notes);
            $("#description").text(dat.Description);
            //$("input:radio[value=" + dat.Visibility + "]").prop("checked", true);
            setEventVisibilitySwitch(dat.Visibility+'');
            var charm = $("#eventCharm").data("charm");
            charm.open();
        }
    });

    if (art.Artist)
        $("#calendarTitle").text("Calendar for " + art.Artist.ArtistName + "/" + usr.Username);
    else $("#calendarTitle").text("Calendar for " + art.ArtistName + "/" + usr.Username);

    var hh = $(".indexHeader").height()-50;

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.listOffset { margin-top: ' + hh + 'px!important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    if ($(".indexHeader").height() > 55)
        $("#calendar").addClass('listOffset');
});
function eventElement(e) {
    var el = "<table class='eventTable'><tr><td class='eventTitleTD'>";
    el += "<a href='#' class='gmEvent' data-id='" + e._id + "'>" + e.title + "</a></td><td class='eventDeleteTD'><a title='Delete event' href='#' data-title='" + e.title + "' data-id='" + e._id+"' class='eventDeleteButton'>x</a></td></tr>";
    return el;
}

function mapEvents(cd) {
    var ed = [];
    var uid = getUserID();

    for (var i = 0; i < cd.length; i++) {
        var cls = "gmEvent";
        if (cd[i].UserID != uid)
            cls = "gmEventDisabled";
        if ((cd[i].Visibility == 2 && cd[i].UserID != uid))
            continue;
        var e = { id: cd[i].CalendarID, title: cd[i].Venue, allDay: true, start: cDate(cd[i].StartTime), end: cDate(cd[i].EndTime), url: cd[i].URL, className: cls, editable: true }
        ed.push(e);
    }
    return ed;
}
function cDate(dt) {
    return dt;
    if (!dt)
        return null;
    dt = dt.replace(/\//g,"-");
    var t = dt.split("-");
    var y, mt, d, h, m, s;
    if (t.length > 2) {
        y = t[0];
        d = t[2].split(" ")[0];
        mt = t[1];

        if (d[0] == '0') d = d.substring(1);
        if (mt[0] == '0') mt = mt.substring(1);
        mt = parseInt(mt) - 1;
        var x = t[2].split(" ")[1].split(":");
        h = x[0];
        if (h[0] == '0') h = h.substring(1);
        m = x[1];
        if (m[0] == '0') m = m.substring(1);
    }

    var dt = new Date(y, mt, d, h, m);
    return dt;
}

function clearEditor() {
    $("#eventDate").val("");
    $("#Venue").val("");
    $("#setupTime").val("12:00am");;
    $("#startTime").val("12:00am");
    $("#endTime").val("12:00am");
    $("#sets").val("1");
    $("#URL").val("");
    $("#notes").text("");
    $("#description").text("");
    $("input:radio[value=0]").prop("checked", true);

}
function checkForOwnership(uid, eUid) {
    if (uid != eUid) {
        $("#eventDate").prop("disabled", true);
        $("#eventDatePicker").data("role", "");
        $("#Venue").prop("disabled", true);
        $("#setupTime").prop("disabled", true);
        $("#startTime").prop("disabled", true);
        $("#endTime").prop("disabled", true);
        $("#sets").prop("disabled", true);
        $("#URL").prop("disabled", true);
        $("#description").prop("disabled", true);
        $("#notes").prop("disabled", true);
        $("input:radio[name='vis']").prop("disabled", true);
        $("#Submit").hide();
    }
    else {
        $("#eventDate").prop("disabled", false);
        $("#Venue").prop("disabled", false);
        $("#setupTime").prop("disabled", false);
        $("#startTime").prop("disabled", false);
        $("#endTime").prop("disabled", false);
        $("#sets").prop("disabled", false);
        $("#URL").prop("disabled", false);
        $("#notes").prop("disabled", false);
        $("#description").prop("disabled", false);
        $("input:radio[name='visibility']").prop("disabled", false);
        $("#Submit").show();
    }
}