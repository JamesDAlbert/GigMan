var art;

$(document).ready(function () {
    var band = getiRequestName();

    band = artistByiRequestName(band);
    art = JSON.parse(sessionStorage.getItem("artist"));
    var data = calendarList(-1, art.ArtistID);
    dta = mapEvents(data);
    showEvents(dta);
    
    $(document).on("click", ".eventListing", function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var dat = null;
        for (var i = 0; i < data.length; i++)
            if (data[i].CalendarID == id) {
                dat = data[i];
            }
        if (dat) {
            $("#eventTitle").text(art.ArtistName + " Event!");
            var evDate = formatDate(dat.Date);
            $("#startTime").text(formatTime(dat.StartTime));
            $("#endTime").text(formatTime(dat.EndTime));

            $("#date").text(evDate);
            var venue = "";
            if (dat.URL.trim() != "") {
                venue = "<a class='eventLink' href='";
                if (dat.URL.indexOf("http://") < 0)
                    dat.URL = "http://" + dat.URL;
                venue += dat.URL + "' target='_blank'>" + dat.Venue + "</a>";
            }
            else venue = dat.Venue;
            $("#venue").html(venue);

            $("#description").html(dat.Description);

            charm = $("#eventCharm").data("charm");
            charm.open();
        }
    });
    $("#closeCharm").click(function () {
        charm = $("#eventCharm").data("charm");
        if (charm.element.data("opened") === true)
            charm.close();
    });
});
function showEvents(dta) {
    var lst = "<ul>";
    if (dta.length < 1)
        lst += "No upcoming events.";
    for (var i = 0; i < dta.length; i++)
    {
        lst += "<li><a class='eventListing' data-id='" + dta[i].id + "'>" + formatDate(dta[i].start) + "&nbsp;<b>" + dta[i].title + "</b></a></li><br/>";
    }
    lst += "</ul>";
    $("#calendar").append(lst);
}

function formatDate(dt) {

    //var df = dt.split(" ")[0];
    //var ds = df.split("/");
    //var d = new Date(parseInt(ds[2]), parseInt(ds[1]) - 1, parseInt(ds[0])).toString();
    var d = new Date(dt).toString();
    return d.substring(0, d.indexOf(":")-2);
}
function formatTime(tt1) {
    var d1 = tt1.split(" ")[1].split(":");
    var t1 = pad(d1[0]) + ":" + pad(d1[1]);
    if (tt1.indexOf("AM") > -1) t1 += "AM";
    if (tt1.indexOf("PM") > -1) t1 += "PM";

    return t1;
}
function mapEvents(cd) {
    var ed = [];

    var uid = getUserID();
    for (var i = 0; i < cd.length; i++) {
        var cls = "gmEvent";
        var e = { id: cd[i].CalendarID, title: cd[i].Venue, allDay: true, start: cDate(cd[i].StartTime), end: cDate(cd[i].EndTime), url: cd[i].URL, className: cls, editable: true }
        ed.push(e);
    }
    return ed;
}
function cDate(dt) {
    if (!dt)
        return null;
    /*
    var t = dt.split("/");
    var y, mt, d, h, m, s;
    if (t.length > 2) {
        y = t[2].split(" ")[0];
        mt = t[1];
        d = t[0];
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
    return dt;*/
    dt = new Date(Date.parse(dt));
    return dt;
}
function pad(val) {
    if (val < 10 && val.length < 2)
        val = "0" + val;
    return val;
}