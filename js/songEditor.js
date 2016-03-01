"use strict";
var tsong;
var keyList = ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];

$(document).ready(function () {
    var ml = getMasterSongList();
    var ttls = jLinq.from(ml).distinct("Title");
    var arts = jLinq.from(ml).distinct("Artist");
    var cats = jLinq.from(ml).distinct("Category");
    $("#SongEditorLyrics").each(function () { this.style.setProperty('font-face', getSession("lyricFont"), 'important'); });

    $("#SongEditorLyrics").css({"wrap":"soft","white-space":"pre","font-size":"16px"});

    for (var i = 0; i < ttls.length; i++)
    {
        var o = "<option value='" + reverseArticle(ttls[i]) + "'>" + reverseArticle(ttls[i]) + "</option>";
        $("#Titles").append(o);
    }
    for (var i = 0; i < arts.length; i++)
    {
        var o = "<option value='" + reverseArticle(arts[i]) + "'>" + reverseArticle(arts[i]) + "</option>";
        $("#Artists").append(o);
    }
    for (var i = 0; i < cats.length; i++)
    {
        var o = "<option value='" + cats[i] + "'>" + cats[i] + "</option>";
        $("#Categories").append(o);
    }


    $("#SongEditorGenre option").remove(); // Remove all <option> child tags.
    $.each(genres(), function (index, item) { // Iterates through a collection
        $("#SongEditorGenre").append( // Append an object to the inside of the select box
            $("<option></option>") // Yes you can do this.
                .text(item.Name)
                .val(item.ID)
        );
    });

    $("#SongEditorTempo option").remove(); // Remove all <option> child tags.
    $.each(tempos(), function (index, item) { // Iterates through a collection
        $("#SongEditorTempo").append( // Append an object to the inside of the select box
            $("<option></option>") // Yes you can do this.
                .text(item.Name)
                .val(item.ID)
        );
    });

    $("#SongEditorFamiliarity option").remove(); // Remove all <option> child tags.
    $.each(familiarities(), function (index, item) { // Iterates through a collection
        $("#SongEditorFamiliarity").append( // Append an object to the inside of the select box
            $("<option></option>") // Yes you can do this.
                .text(item.Name)
                .val(item.ID)
        );
    });

    $("#SongEditorKey option").remove(); // Remove all <option> child tags.
    $.each(keyList, function (index, item) { // Iterates through a collection
        $("#SongEditorKey").append( // Append an object to the inside of the select box
            $("<option></option>") // Yes you can do this.
                .text(item)
                .val(index)
        );
    });

    var parms = getParentQueryParameters(document.location.search);
            
    if (parms.id != null) {
        tsong = songByID(parms.id,getActiveArtistID());
        populateEditor(tsong);
    }
    $("#ClearEditor").click(function () {
        $("#SongEditorTitle").val("");
        $("#SongEditorArtist").val("");
        $("#SongEditorCategory").val("");
        $("#SongEditorSampleURL").val("");
        $("#SongEditorLyrics").val("");
        $("#SongEditorGenre").val(genres()[0].ID);
        $("#SongEditorKey").val("0");
        $("#SongEditorFamiliarity").val(familiarities()[0].ID);
        $("#SongEditorTempo").val(tempos()[0].ID);     
        $("#SongEditorNotes").val("0");
        tsong = { ID:0 }
    });
    $("#SongEditorSubmit").click(function () {
        $("#EditorMessage").text("");
        var idx = -1;
        var sl = getMasterSongList();
        if (!tsong) {
            tsong = {};
            tsong.ID = 0;
        }
        else {
            var indexes = $.map(sl, function (obj, index) {
                if (obj.ID == tsong.ID) {
                    return index;
                }
            })
            idx = indexes[0];
        }
        tsong.Title = $("#SongEditorTitle").val();
        tsong.Artist = $("#SongEditorArtist").val();
        tsong.Category = $("#SongEditorCategory").val();
        tsong.Sample = $("#SongEditorSampleURL").val();
        tsong.Lyrics = $("#SongEditorLyrics").val();
        tsong.Genre = $("#SongEditorGenre").val();
        tsong.Key = $("#SongEditorKey").val();
        tsong.Familiarity = $("#SongEditorFamiliarity").val();
        tsong.Tempo = $("#SongEditorTempo").val();
        tsong.Public = $("#isPublic").prop("checked");
        tsong.Notes = $("#SongEditorNotes").val();
        tsong.ArtistID = getActiveArtistID();
        tsong.PlayCount = 0;
        var res = songSave(tsong);
        tsong.Status = 1;
        
        if (tsong.ID > 0) {
            sl[idx] = tsong;
        }
        else {
            tsong.ID = res;
            tsong.LastPlayed = "1970-01-01";
            sl.push(tsong);
        }
        setLocal("songlist", JSON.stringify(sl));
        setLocal("dirty", true);
        if (res)
        {
            $("#EditorMessage").css("color","lime");
            $("#EditorMessage").text("Song saved.");
        }
        else {
            $("#EditorMessage").css("color:red");
            $("#EditorMessage").text("There was an error saving your song to the database. It has been saved locally.")
        }
        if ($("#SongList").length > 0)
        {
            if ($("#SongList", window.parent.document).length > 0) {
                var tbl = $("#SongList", window.parent.document).dataTable();
                if (tbl) {
                    parent.location.reload();
                }
            }
        }
    });
});
function populateEditor(sng) {
    if (sng == null)
        return;
    tsong = sng;
    $("#isPublic").prop("checked", sng.Public);
    $("#SongEditorTitle").val(tsong.Title);
    $("#SongEditorArtist").val(tsong.Artist);
    $("#SongEditorCategory").val(tsong.Category);
    $("#SongEditorSampleURL").val(tsong.Sample);
    
    $("#SongEditorLyrics").val(tsong.Lyrics);
    if (tsong.Sample != "") {
        $("#playLink").attr("href", tsong.Sample);
        $("#playLink").toggleClass("fg-orange");
    }
    $("#SongEditorGenre").val(tsong.Genre);
    $("#SongEditorKey").val(tsong.Key);
    $("#SongEditorTempo").val(tsong.Tempo);
    $("#SongEditorFamiliarity").val(tsong.Familiarity);
}
function modList(dat) {
    for (var i = 0; i < dat.length; i++) {
        dat[i].text = dat[i].Name;
        dat[i].id = dat[i].ID;
    }
    return dat;
}
function loadList(lst, menu) {
    for (var i = 0; i < lst.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = "<a data-genre='" + lst[i].ID + "'>" + lst[i].Name + "</a>";
        menu.appendChild(li);
    }
}
function getParentQueryParameters() {
    var queryStringKeyValue = window.parent.location.search.replace('?', '').split('&');
    var qsJsonObject = {};
    if (queryStringKeyValue != '') {
        for (var i = 0; i < queryStringKeyValue.length; i++) {
            qsJsonObject[queryStringKeyValue[i].split('=')[0]] = queryStringKeyValue[i].split('=')[1];
        }
    }
    return qsJsonObject;
}
function resizeTextArea() {
    //Wrap your form contents in a div and get its offset height
    var heightOfForm = document.getElementById('textAreaDiv').offsetHeight;
    //Get height of body (accounting for user-installed toolbars)
    var heightOfBody = document.body.clientHeight;
    var buffer = 35; //Accounts for misc. padding, etc.
    //Set the height of the textarea dynamically
    document.getElementById('SongEditorLyrics').style.height =
        (heightOfBody - heightOfForm) - buffer;
    //NOTE: For extra panache, add onresize="resizeTextArea()" to the body
}