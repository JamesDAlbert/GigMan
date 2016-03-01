"use strict";

$(document).ready(function () {

    if (!checkLoginStatus())
        location.href = "default.html";
    var parms = getQueryParameters(document.location.search);
    var paging = false;
    var sDom = "t";
    var songListLength = parseInt(getSession("songListLength"));
    if (songListLength > -1) {
        paging = true;
        sDom = "";
    }
    var songList = getMasterSongList();
    var table;
    var hideCols = !getSession("narrowtable");
    if (!$.fn.DataTable.isDataTable('#SongList')) {
        table = $('#SongList').dataTable({
            buttons: [{ extend: "print", text: "" }, { extend: "csvHtml5", text: "" }, /*,
                {
                    text: "<span class='mif-alarm'></span>",
                    className:"orderByDate",
                    action: function (e, dt, node, config) {
                        orderSongsByAddedDate();
                    }
                }*/],
            "colVis": {
                "buttonText": "<span class='mif-more-horiz'></span>"
            },
            "aaData":songList,
            "bPaginate": paging,
            "paging": paging,
            "bDestroy":false,
            "sPaginationType": "simple_numbers",
            "iDisplayLength":songListLength,
            orderClasses: false,
            "sDom": '<"toolbar"><"toLeft"f>BCt<"toLeft"f>',
            "bLengthChange":false,
            responsive: true,
            fixedHeader: { header: true },
            "offsetTop": 43,
            "oLanguage" : {
                "sEmptyTable": "There are no songs in the song list.",
                "sSearch":""
            },
            "aoColumnDefs": [
            {
                "bSortable": false, "aTargets": 0, "visible" : hideCols,"mRender": function (value, type, full) {
                    return "<a class='songEditLink' href='#' data-songid='" + full.ID + "' title='Edit song'><span class='mif-pencil'></span></a>&nbsp;&nbsp;" + 
                        "<a class='songDeleteLink' href='#' data-songid='" + full.ID + "' title='Delete song'><span class='mif-cross'></span></a>&nbsp;&nbsp;" +
                        "<a class='updateCountLink' href='#' data-songid=' " + full.ID + "' title='Update song play count'><span class='mif-plus'></span></a>";
                }
            },
            {
                "aTargets": 1, "visible": parms.v != "o" & hideCols, "mRender": function (value, type, full)
                {
                    var dt = getDate(full.LastPlayed);
                    return "<span class='songCount' style='cursor:pointer' title='" + dt + "'>" + full.PlayCount + "</span>";
                }
            },
            { "aTargets":2,"sClass":"slTitle", "mRender":function(value,type,full) {
                return "<a class='songLink' data-songid='" + full.ID +"'>" + full.Title + "</a>";
                }
            },
            {"aTargets":3, "sClass":"slArtist", "mRender":function(value,type,full) {
                return "<a class='artistLink' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "'>" + full.Artist + "</a>";
                }
            },
            {"aTargets":4, "visible":hideCols, "mRender":function(value,type,full) {
                return "<a class='genreLink' data-genre='" + escape(encodeURI(full.Genre)) + "'>" + genreNameFromID(full.Genre) + "</a>";
                }
            },
            {"aTargets":5, "visible":hideCols, "mRender":function(value,type,full) {
                return "<a class='categoryLink' data-category='" + escape(encodeURI(full.Category)) + "'>" + full.Category + "</a>";
                }
            },
            {
                "aTargets": 6, "visible": true, "mRender": function (value, type, full) {
                    return "<span>" + full.AddedDate + "</span>";
                }
            },
            {"aTargets":7, "visible":false, "mRender":function(value,type,full) {
                return "<span>" + full.PlayCount + "</span>";
                }
            },

            ],         
        });       
    }
    $(".orderByDate").prop("title", "Order songs by date added.");
    $(".orderByDate").css({ "height": "30px", "width": "30px" });
    $(".orderByDate span").css({ "margin-top": "-6px", "margin-left": "1px" });
    $("input[type=search]").attr("placeholder", "Enter Search term");
    $(".dataTables_filter input").css("float", "right").css("margin-right", "5px");

    $("#SongList").hide();
    if (jQuery.isEmptyObject(parms))
        parms = { v: "song" };
    var ls = getSession(parms.v + "ListStyle");
    //document.getElementById("ListStyle").checked = ls == "tile" ? false : true;
    $(document).on("click", ".updateCountLink", function (e) {
        e.preventDefault();
        var count = songUpdateAccessDate($(this).data("songid").trim());
        if (!isNaN(count))
            $(this).closest("tr").find(".songCount").html(count);
    });
    function toggleColumnVisibility(colIdx) {
        var bVis = table.fnSettings().aoColumns[colIdx].bVisible;
        table.fnSetColumnVis(colIdx, bVis ? false : true);
    }

/*    $("#ListType .slide-switch-input").on("click", function (e) {
        e.preventDefault();
        var sch = $(this).val();
        setListTypeSwitch(sch);
    });*/
    
    $("#ListType .slide-switch-input").click(function (e) {
        e.preventDefault();
        var type = $(this).val();
        setListTypeSwitch(type);
        setSession(parms.v + "ListStyle", type)
        
        switch (parms.v)
        {
            case "cs": showCategories(); break;
            case "c": showCategory(parms.c); break;
            case "gs": showGenres(); break;
            case "g": showGenre(parms.g); break;
            case "as": showArtists(); break;
            case "a": showArtist(parms.a); break;
            case "song": showSongs(); break;
            case "o": showUnplayed(); break;
            case "s": showSearchResults(parms.a); break;
        }
    });
    var lt = getSession(parms.v + "ListStyle");
    setListTypeSwitch(lt);
    switch (parms.v)
    {
        case "cs": showCategories(); break;
        case "c": showCategory(parms.c); break;
        case "gs": showGenres(); break;
        case "g": showGenre(parms.g); break;
        case "as": showArtists(); break;
        case "a": showArtist(parms.a); break;
        case "song": showSongs(); break;
        case "o": showUnplayed(); break;
        case "s": showSearchResults(parms.a); break;
    }

    
    $("#DataList").css("margin-left", "0");
    var hh = $(".pageHeader").height() - 40;
    $("#DataList").css("margin-top", (hh+3)+"px");
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.listOffset { margin-top: ' + hh + 'px!important; } .tileOffset { margin-top:' + (hh+10) + 'px!important}';
    document.getElementsByTagName('head')[0].appendChild(style);
    $("#SongTiles").addClass('tileOffset');
    $('#SongList_wrapper').addClass('listOffset');
    $(".buttons-print").prop("title","Print the songlist.");
    $(".buttons-csv").prop("title", "Export the songlist to a CSV file");
    $(".buttons-colvis").prop("title", "Hide/Show songlist columns.");
    $(".myTile").css({ "height": getSession("tileheight"), "width": getSession("tilewidth"), "font-size": getSession("tilefontsize") });

});

function getDate(dt) {
    if (!dt)
        return "n/a";
    if (dt.indexOf("1753") > -1)
        return "n/a";
    else return dt.substring(0,dt.indexOf(" "));
}

function showCategories() {
    var dta = categories(getActiveArtistID());
    if (getSession("csListStyle") == "tile")
        tileData(dta, "category", "Categories (" + dta.length + ")");
    else listData(dta, "category", "Categories (" + dta.length + ")");
}
function filterColumn(col,val) { // 5
    $("#SongList").DataTable().column(col).search(val, true, false).draw();
}

function showCategory(c)
{
    var cDat = c;
    var ttl = c;

    if (c.indexOf("/") > -1)
    {
        cDat = c.replace("/","|");
        ttl = c.replace("/", " | ");
    }
    if (getSession("cListStyle") == "tile") {
        var dta = getSongList("", "", c);
        dta = jlinq.from(dta).sort("Name").select();
        tileData(dta,"song","Category - " + ttl + " (" + dta.length + ")");
    }
    else {
        $("#DataList").hide();
        $("#SongTiles").hide();
        /*$("#SongList").dataTable().fnFilter(
            c,
            5,
            true, true);*/
        filterColumn(5, cDat);
        $('#SongList').parents('div.dataTables_wrapper').first().show();
        $('#SongList').show();
        $("#Title").html("Category - " + ttl + " (" + $("#SongList").dataTable().fnSettings().fnRecordsDisplay() + ")");
    }
}

function showGenres() {
    var dta = genresByArtistID(getActiveArtistID());
    dta = jlinq.from(dta).sort("Name").select();
    var sng = getMasterSongList();
    for (var i = 0; i < dta.length; i++) {
        dta[i].Count = sng.filter(function (el) {
            return el.Genre == dta[i].ID
        }).length;
    }
    dta = jlinq.from(dta).greater("Count",0).select()
    if (getSession("gsListStyle") == "tile")
        tileData(dta, "genre", "Genres (" + dta.length + ")"); 
    else listData(dta, "genre", "Genres (" + dta.length + ")");
}

function showGenre(g)
{
    var gnr = g;
    if (parseInt(g).toString() == g)
        gnr = genreNameFromID(g);
    
    var x;
    if (getSession("gListStyle") == "tile") {
        var dta = getMasterSongList();
        dta = jLinq.from(dta)
        .equals("Genre", genreIDFromName(g))
        .select();
        tileData(dta, "song", "Genre - " + gnr + " (" + dta.length + ")");
    }
    else {
        $("#SongList").dataTable().fnFilter(
            gnr,
            4,
            true, true);
        $("#DataList").hide();
        $("#SongTiles").hide();
        $('#SongList').parents('div.dataTables_wrapper').first().show();
        $('#SongList').show();
        $("#Title").html("Genre - " + gnr + " (" + $("#SongList").dataTable().fnSettings().fnRecordsDisplay() + ")");
    }
}
function showUnplayed()
{
    var x;
    if (getSession("oListStyle") == "tile") {
        var dta = getMasterSongList();
        dta = jLinq.from(dta)
        .equals("PlayCount", "0")
        .select();
        tileData(dta, "song", "Unplayed Songs (" + dta.length + ")");
    }
    else {
        $("#SongList").dataTable().fnFilter(
           "0",
            1);
        $("#DataList").hide();
        $("#SongTiles").hide();
        $('#SongList').parents('div.dataTables_wrapper').first().show();
        $('#SongList').show();
        $("#Title").html("Unplayed Songs (" + $("#SongList").dataTable().fnSettings().fnRecordsDisplay() + ")");
    }
}
function showArtists()
{
    var dta = songArtists(getActiveArtistID());
    if (getSession("asListStyle") == "tile")
        tileData(dta, "artist", "Composers (" + dta.length + ")");  
    else listData(dta, "artist", "Composers (" + dta.length + ")");
}
function showArtist(a)
{
    if (getSession("aListStyle") == "tile") {
        a = reverseArticle(a);
        var dta = getMasterSongList();
        dta = jLinq.from(dta)
        .contains("Artist", a).select();
        tileData(dta, "song", "Composer - " + a + " (" + dta.length + ")");
    }
    else {
        $("#SongList").dataTable().fnFilter(
        a,
        null,
        true, true);
        $("#DataList").hide();
        $("#SongTiles").hide();
        $('#SongList').parents('div.dataTables_wrapper').first().show();
        $('#SongList').show();
        var nRec = $("#SongList").dataTable().fnSettings().fnRecordsDisplay();
        $("#Title").html("Composer - " + a + " (" + $("#SongList").dataTable().fnSettings().fnRecordsDisplay() + ")");
    }
}
function showSongs() {
    var dta = getMasterSongList();
    if (getSession("songListStyle") == "tile")
        tileData(dta, "song", "Master Song List");
    else {
        $('#SongList').parents('div.dataTables_wrapper').first().show();
        $('#SongList').show();
        $("#SongTiles").hide();
        $("#DataList").hide();
    }
    $("#Title").html("Master Song List (" + $("#SongList").dataTable().fnSettings().fnRecordsDisplay() + ")");
}

function showSearchResults(term)
{
    var dta = getMasterSongList();
    var sngs = jLinq.from(dta).contains("Title", term).or().contains("Lyrics", term).select();
    var arts = jLinq.from(songArtists(getActiveArtistID())).contains("Name", term).select();
    var a = [];
    arts = jLinq.from(arts).sort("Name").select();
    for (var i = 0; i < arts.length; i++)
    {
        arts[i].Type = "artist";
        a.push(arts[i]);
    }
    sngs = jLinq.from(sngs).sort("Artist", "Title").select();
    for (var i = 0; i < sngs.length; i++)
    {
        sngs[i].Type = "song";
        a.push(sngs[i]);
    }
    
    if (getSession("sListStyle") == "tile")
        tileData(a, "mixed", "Search Results - '" + term + "' (" + (sngs.length + arts.length) + ")");
    else listData(a,"mixed","Search Results - '" + term + "' (" + (sngs.length + arts.length) + ")");
}

function listData(dta, type, ttl)
{

    $("#SongTiles").hide();
    $('#SongList').parents('div.dataTables_wrapper').first().hide();
    $('#SongList').hide();
    $("#DataList").show();
    $("#Title").text(ttl);
    var table = document.getElementById("DataList");

    $(table).empty();
    if (!dta || dta.length < 1)
    {
        var r = table.insertRow(0);
        var c = r.insertCell(0);
        c.innerHTML = "<br>There are no songs in the songlist.";
        return;
    }
    table.style.width = "100%";
    table.style.margin = "10px";
    table.style.fontSize = "larger";
    table.style.borderCollapse = "collapse";
    var cols = 1;
    if (dta.length * 40 > window.innerHeight)
        cols = Math.floor((window.innerWidth-40) / 40);
    if (cols > 2 || type != "genres")
        cols = 2;
    if (type == "artist")
        cols = 5;
    var j = 0, k = 0, r, c;
    var typ = type;
    var r;
    for (var i = 0; i < dta.length; i++)
    {
        if (type == "mixed")
            typ = dta[i].Type;
        if ((i % cols) == 0)
        {
            r = table.insertRow(k);
            j = 0;
            k++;
        }
        var rCls = "listRow";
        if (k % 2 != 0)
            rCls = "altListRow";
        r.className = rCls;
        var a = "<a class='" + typ + "Link' href='#' ";
        var nm = dta[i].Name;
        if (nm == "") nm = "[No Category]";
        var cnt = "";
        if (dta[i].Count && ttl.indexOf("Search Results") != 0) {
            cnt = " (" + dta[i].Count + ")";
            if (dta[i].Count == 0)
                continue;
        }
        switch (type)
        {
            case "artist": a += "data-artist='" + encodeURI(escape(dta[i].Name)) + "'"; break;
            case "category": a += "data-category='" + encodeURI(escape(dta[i].Name)) + "'"; break;
            case "genre": a += "data-genre='" + encodeURI(escape(dta[i].Name)) + "'"; break;
            case "mixed":
                if (typ == "artist") { nm = dta[i].Name; a += "data-artist='" + encodeURI(escape(dta[i].Name)) + "'"; }
                else { nm = dta[i].Title + "&nbsp; / &nbsp;" + dta[i].Artist; a += "data-artist='" + encodeURI(escape(dta[i].Artist)) + "' data-songid='" + dta[i].ID + "' data-title='" + encodeURI(escape(dta[i].Title)) + "'"; }
                break;
        }
        
        a += ">" + nm + cnt + "</a>";
        c = r.insertCell(j);
        c.style.verticalAlign = "middle";
        c.style.border = "1px solid gray";
        c.style.paddingLeft = "10px";
        c.class="songLink";
        c.innerHTML = a;
        j++;
    }
    while (j < cols)
    {
        c = r.insertCell(j);
        c.style.verticalAlign = "middle";
        c.style.border = "1px solid gray";
        c.style.paddingLeft = "10px";
        c.class = "songLink";
        j++;
    }
}

function tileData(dta, type, ttl) {
    var hdg ="", hdgSpan = document.createElement("h3");

    var wrapper = document.getElementById("SongTiles");
    if (type == "mixed")
    {
        dta = jlinq.from(dta).sort("Title","Name").select();
    }
    else dta = jlinq.from(dta).sort("Title","Name").select();
    wrapper.innerHTML = "";
    $("#SongTiles").show();
    $('#SongList').parents('div.dataTables_wrapper').first().hide();
    $('#SongList').hide();
    $("#DataList").hide();
    $("#Title").text(ttl);

    var group = document.createElement("div");
    group.className = "tile-group";
    group.style.margin = "10px";
    group.style.padding = "0";
    var tile_c = "t-nn";
    var container;
    var stLetter = '[',
        newLetter = false,
        isNum = false,
        numDone = false;
    var typ = type;
    var cls = "evenSet";
    var colIdx = -1;
    var hc = getSession("colorscheme") == "highcontrast";
    var neverMore = false;
    for (var i = 0; i < dta.length; i++) {
        if (type == "mixed")
        {
            typ = dta[i].Type;
            if (dta[i].Type != hdg && dta[i].Type == "artist")
            {
                hdg = dta[i].Type;
                hdgSpan = document.createElement("h3");
                hdgSpan.innerHTML = hdg[0].toUpperCase() + hdg.substring(1);
                wrapper.appendChild(hdgSpan);
            }
        }
        if ((typ == "song" && dta[i].Title[0] != stLetter) || (typ != "song" && dta[i].Name[0] != stLetter))
        {
            if (typ == "song") stLetter = dta[i].Title[0];
            else stLetter = dta[i].Name[0];
            newLetter = true;
        }
        if (neverMore && i % 4 == 0)
            neverMore = false;
       
        if (newLetter && (isNaN(stLetter) || (!isNaN(stLetter) && !numDone)) && !neverMore) {
            if (newLetter)
            {
                if (!isNaN(stLetter)) numDone = true;
                var span = document.createElement("span");
                span.className = "charmLabelBold";
                if (!isNaN(stLetter))
                {
                    span.innerHTML = "1..9 <br/>";
                    tile_c = "t-nn";
                }
                else if (stLetter) { span.innerHTML = stLetter + "<br/>"; tile_c = "t-" + stLetter.toLowerCase(); }
                else { continue; }
                if (type == "genre")
                    span.innerHTML = "";
                wrapper.appendChild(span);
                colIdx++;
                if (type == "mixed")
                {
                    if (dta[i].Type != hdg && dta[i].Type == "song")
                    {
                        hdg = dta[i].Type;
                        hdgSpan = document.createElement("h3");
                        hdgSpan.innerHTML = "<br/><br/><br/>" + hdg[0].toUpperCase() + hdg.substring(1);
                        container.appendChild(hdgSpan);
                    }
                }
            }
            container = document.createElement("div");
            container.className = "tile-container";
            $(container).css({ "position": "relative" });
            if (newLetter)
                container.appendChild(span)
            group.appendChild(container);
            newLetter = false;
            neverMore = type == "genre";
            if (cls == "evenSet") cls = "oddSet"; else cls = "evenSet";
        }
        if (neverMore)
            if (cls == "evenSet") cls = "oddSet"; else cls = "evenSet";
        var tile = document.createElement("div");
        tile.className = "tile tile-small-y gm-bg fg-white myTile " + tile_c;
        var tilec = document.createElement("div");
        var fg = "";
        if (colIdx >= allColors.length)
            colIdx = 0;
        if (!hc) fg = calculateForegroundColor(allColors[colIdx]);
        else if (cls == "evenSet") fg = "black"; else fg = "white";
        //var bgc = "background-color:" + allColors[colIdx] + ";color:" + fg;
        var bgc = "";
        if (hc) bgc = "";
        var cnt = 0;
        var nm = "";
        if (typ == "genre" || typ == "category") {
            $(tilec).attr("data-" + type, encodeURI(escape(dta[i].Name)));
            nm = "<span class='tileTitle'>" + dta[i].Name + "</span>";
            cnt = "<span class='tileTitle'>" + dta[i].Count + "</span>";
            if (dta[i].Count == 0)
                continue;
        }
        else if (typ == "song") {
            $(tilec).attr("data-title", encodeURI(escape(dta[i].Title)));
            $(tilec).attr("data-artist", encodeURI(escape(dta[i].Artist)));
            $(tilec).attr("data-songid", dta[i].ID);

            var dt = dta[i].LastPlayed.substring(0,dta[i].LastPlayed.indexOf("T"));
            nm = "<span class='tileTitle'>" + dta[i].Title + "</span>";
            nm += "<br/><a class='artistLink' style='font-style:italic;margin-top:5px;font-size:smaller' data-artist='" + escape(encodeURI(dta[i].Artist)) + "'>" + dta[i].Artist + "</a>";
        }
        else if (typ == "artist")
        {
            $(tilec).attr("data-artist", encodeURI(escape(dta[i].Name)));
            nm = "<span class='tileTitle'>" + dta[i].Name + "</span>";
            cnt = "<span class='tileTitle'>" + dta[i].ID + "</span>";
            if (dta[i].Count == 0)
                continue;
        }

        tilec.className = "tile-content myTile " + typ + "Tile" + " " + cls + " " + tile_c;
        tilec.innerHTML = nm + " ";
        if (bgc != "")
            $(tilec).attr("style", bgc);
        if (cnt != null && type != "song") tilec.innerHTML += "(" + cnt + ")";
        if (typ == "songx")
            tilec.innerHTML += "<div style='clear:both'></div><div style='position:absolute; bottom:0;left:0;width:100%;padding:3px;'><a style='float:left;' class='songEditLink' data-songid='" + dta[i].ID + "'><span class='mif-pencil' style='color:" + fg + "'></span></a>&nbsp;&nbsp;" +

            "<a style='float:right;' class='songDeleteLink' data-songid='" + dta[i].ID + "'><span class='mif-cross' style='color:" + fg + "'></span></a></div>"
        tile.appendChild(tilec);
        container.appendChild(tile);
    }
    wrapper.appendChild(group);
}