"use strict";
var setLists = [];
var setIdx = 0, subsetIdx = 0, maxSetIdx, maxSubsetIdx;
var songs, masterList;
var setTbl;
$(document).ready(function () {
    setListTypeSwitch(getSession("setListStyle"));
    $("#colorScheme").prop("checked", getSession("colorscheme") == "highcontrast");
    var sl = setlists(getActiveArtistID()); // get all the setlist names
    maxSetIdx = sl.length - 1;
    for (var i = 0; i < sl.length; i++)
    {
        var ss = subsets(sl[i],getActiveArtistID());
        var s = { Set: sl[i], Subsets: ss };
        setLists.push(s);
    }
    masterList = getMasterSongList();
    showSetnames();
    $(".buttons-print").prop("title", "Print the songlist.");
    $(".buttons-csv").prop("title", "Export the songlist to a CSV file");
    $(".buttons-colvis").prop("title", "Hide/Show songlist columns.");
    $(".nextSet").prop("title", "Next Setlist.");
    $(".prevSet").prop("title", "Previous Setlist.");
    $(".nextSubset").prop("title", "Next sub-set.");
    $(".prevSubset").prop("title", "Previous sub-set.");
});



function nextSetlist() {
    if (setLists.length == 1)
        return;
    setIdx++;
    if (setIdx > maxSetIdx)
        setIdx = 0;
    maxSubsetIdx = setLists[setIdx].Subsets.length - 1;
    subsetIdx = 0;
    showSetnames();
};
function prevSetlist() {
    if (setLists.length == 1)
        return;
    setIdx--;
    if (setIdx < 0)
        setIdx = maxSetIdx;
    maxSubsetIdx = setLists[setIdx].Subsets.length - 1;
    subsetIdx = 0;
    showSetnames();
};
function nextSubset() {
    subsetIdx++;
    if (subsetIdx > maxSubsetIdx)
        subsetIdx = 0;
    showSetnames();
};
function prevSubset() {
    subsetIdx--;
    if (subsetIdx < 0)
        subsetIdx = maxSubsetIdx;
    showSetnames();
};

function initDataTables() {
    $("#SongTiles").hide();
    $('#SongList').parents('div.dataTables_wrapper').first().show();
    $('#SongList').show();
    var plen = parseInt(getSession("setListLength"));
    var sDom = "BCtp";
    if (plen == -1) sDom = "BCt";
    if (!setTbl) {
        jQuery('#SongList').dataTable().fnDestroy();
        setTbl = $('#SongList').dataTable({
            buttons: [{ text: '', className: "prevSet", action: function () { prevSetlist() } }, { text: '', className: "prevSubset", action: function () { prevSubset(); } },
                { text: '', className: "nextSubset", action: function () { nextSubset(); } }, { text: '', className: "nextSet", action: function () { nextSetlist(); } },
                { extend: "print", text: "" }, { extend: "csvHtml5", text: "" }/*, { extend: "colvis", text: "" }*/],
            "colVis" : {
                "buttonText":"<span class='mif-more-horiz'></span>"
            },
            "aaData": songs,
            "bPaginate": true,
            "pagingType": "simple_numbers",
            orderClasses: false,
            "bDestroy": false,
            "bLengthChange": false,
            "lengthMenu":[[5,10,20,-1][5,10,20,'All']],
            "pageLength":plen,
            "bFilter": false,
            bServerSide: false,
            "sDom": sDom,
            "aaSorting": [],
            "oLanguage": {
                "sEmptyTable":     "No setlists found.",
                "sSearch":""
            },
            "aoColumnDefs": [
            {
                "aTargets": 0, "mRender": function (value, type, full) {
                    return "<a class='songLink' data-artist='" + reverseArticle(full.Artist) + "' data-title='" + reverseArticle(full.Title) + "' data-songid='" + full.ID + "'>" + full.Title + "</a>";
                }
            },
            {
                "aTargets": 1, "mRender": function (value, type, full) {
                    return "<a class='artistLink' data-artist='" + reverseArticle(full.Artist) + "'>" + full.Artist + "</a>";
                }
            },
            {
                "aTargets": 2, "mRender": function (value, type, full) {
                    return "<a class='genreLink' data-genre='" + full.Genre + "'>" + genreNameFromID(full.Genre) + "</a>";
                }
            },
            {
                "aTargets": 3, "mRender": function (value, type, full) {
                    return "<a class='categoryLink' data-category='" + full.Category + "'>" + full.Category + "</a>";
                }
            },
            {
                "aTargets": 4, "mRender": function (value, type, full) {
                    return "<a class='categoryLink' data-category='" + full.Tempo + "'>" + tempoNameFromID(full.Tempo) + "</a>";
                }
            },
            ],
        });

    }
    else {
        $('#SongList').DataTable().clear();
        $('#SongList').DataTable().rows.add(songs);
        $('#SongList').DataTable().draw();
    }
    $(".ColVis_Button.ColVis_MasterButton").prop("title", "Show/hide columns.");
}
function showTileData()
{
    var wrapper = document.getElementById("SongTiles");
    wrapper.innerHTML = "";
    $("#SongTiles").show();
    $('#SongList').parents('div.dataTables_wrapper').first().hide();
    $('#SongList').hide();


    var group = document.createElement("div");
    group.className = "tile-group";
    group.style.margin = "10px";
    group.style.padding = "0";

    var container;
    var n = window.innerWidth / 150;
    var stLetter = '[',
        newLetter = false,
        isNum = false,
        numDone = false;
    for (var i = 0; i < songs.length; i++) {
        
        if ((i % n) == 0) {
            if (newLetter) {
                if (!isNaN(stLetter)) numDone = true;
                var span = document.createElement("span");
                span.className = "tileDivider";
                if (!isNaN(stLetter))
                    span.innerHTML = "1..9 <br/>";
                else span.innerHTML = stLetter + "<br/>";
                wrapper.appendChild(span);
            }
            container = document.createElement("div");
            container.className = "tile-container";
            if (newLetter)
                container.appendChild(span)
            group.appendChild(container);
            newLetter = false;
        }
        var tile = document.createElement("div");
        tile.className = "tile tile-small-y bg-teal fg-white myTile";
        var tilec = document.createElement("div");
        var nm = "";

        $(tilec).attr("data-title", encodeURI(escape(songs[i].Title)));
        $(tilec).attr("data-artist", encodeURI(escape(songs[i].Artist)));
        $(tilec).attr("data-songid", encodeURI(escape(songs[i].ID)));
        nm = songs[i].Title + "<br/><br/>" + "<a class='artistLink' style='font-style:italic' data-artist='" + escape(encodeURI(songs[i].Artist)) + "'>" + songs[i].Artist + "</a>";
       

        tilec.className = "tile-content myTile songTile";
        tilec.innerHTML = nm + " ";
        if (songs[i].Count != null) tilec.innerHTML += "(" + songs[i].Count + ")";
        
        tile.appendChild(tilec);
        container.appendChild(tile);
    }
    wrapper.appendChild(group);
}

function callback()
{
    setSetlistEditor(setLists[setIdx].Set, setLists[setIdx].Subsets[subsetIdx].SubsetName);
}

function showSetnames()
{
    if (setLists.length > 0) {
        $("#Setname").text(setLists[setIdx].Set);
        $("#Subset").text(setLists[setIdx].Subsets[subsetIdx]);
    }
    getSetData();  
}

function getSetData()
{
    if (setLists.length > 0) {
        var set = setlist(setLists[setIdx].Set, setLists[setIdx].Subsets[subsetIdx], getActiveArtistID());
        maxSubsetIdx = setLists[setIdx].Subsets.length - 1;

        songs = [];
        for (var i = 0; i < set.Songs.length; i++) {
            var sng = jlinq.from(masterList).equals("ID", set.Songs[i].SongID).select();
            songs.push(sng[0]);
        }
    }
    initDataTables();
}

