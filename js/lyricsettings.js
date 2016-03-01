"use strict";
var hasChords = false;
var segments = [];
var keyList = ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];
var showChords;
var showPopupChords;
var superscriptChords;
var showChordHints;
var song;
var useDividers = true;
var dividerSize = 2;
var dividerColor;
var initialized = false;
var notesChanged = false;
$(document).ready(function () {
    $("#FontSize").val(parseInt(getSession("lyricFontSize") + "px"));
        
    if (!checkLoginStatus())
        window.location.href = "default.html";
    showChords = getSession("showChords") == "true";
    showPopupChords = getSession("showPopupChords") == "true";
    superscriptChords = getSession("superscriptChords") == "true";
    showChordHints = getSession("showChordHints") == "true";
    var scheme = getSession("colorscheme");
    if (scheme == "highcontrast")
        $("#colorScheme").prop("checked", true);

    $(".keyPad").click(function () {
        var keyStr = "";
        keyStr = $(this).data("key");
        $(".keyPad").removeClass("selected");
        $(this).addClass("selected");
        // $("#SongKey").html("Key - " + keyList[$(this).data("key")]);
        parent.transposeChords($(this).data("key"));
    });
    $(document).on("click", ".lyricsBlock", function (a) {
        if ($(this)[0].open)
            $(this)[0].removeAttribute("open");
        else $(this)[0].open = true;
    });
    $("#ChordVisibility").prop("checked", getSession("showChords"));
    $("#ChordVisibility").click(function() {
        showChords = this.checked;
        setSession("showChords", showChords);
        if (showChords)
            window.parent.$("chordset").show();
        else window.parent.$("chordset").hide();

    });
    $("#PopupChordHints").prop("checked", getSession("showChordHints"));
    $("#PopupChordHints").click(function() {
        setSession("showChordHints", this.checked);
        showChordHints = parent.showChordHints = this.checked;
    });
    $("#PopupChordVisibility").prop("checked", getSession("clickableChord"));
    $("#PopupChordVisibility").click(function() {
        showPopupChords = !showChordHints;
        if (showPopupChords) {
            window.parent.$("chord").addClass("clickableChord");
            $("#PopupChordHints").prop("disabled", false);
        }
        else {
            window.parent.$("chord").removeClass("clickableChord");
            $("#PopupChordHints").prop("checked", false);
            $("#PopupChordHints").prop("disabled", false);
            window.parent.showChordHints = showChordHints = false;
            parent.adjustLyricsArea();
        }
        setSession("showPopupChords", showPopupChords);
    });
    $("#RightSliderVisibility").prop("checked", getSession("rightSliders"));
    $("#RightSliderVisibility").click(function () {
        setSession("rightSliders", this.checked);
        if (this.checked)
            $("#RightSliders").show();
        else $("#RightSliders").hide();
        parent.adjustLyricsArea();
    });
    $("#IncPlayCount").click(function () {
        incrementSongCount(parms.a,parms.t);
    });

    var parms = getQueryParameters(document.location.search);

    
   $("#FontSize").on("input", function (ev, ui) {
       sliderChange(ev, ui);
       parent - init();
    });
       
    if (parms.id != null)
    {
        song = songByID(parms.id,getActiveArtistID());

        song.SongID = parseInt(song.SongID);
        song.Key = parseInt(song.Key);
        $("#sTranspose").css("height", (window.innerHeight - 50) / 2);
        $("#sChangeFontSize").css("height", (window.innerHeight - 100) / 2);
        $("#FontSize").val(parseInt(getSession("lyricFontSize")));
        setFontSlider(parseInt(getSession("lyricFontSize")),true);


        $(".lyricsDiv").css("font-size", getSession("lyricFontSize"));
        $("#lyricsDiv").css("font-size", getSession("lyricFontSize"));
        setKeySlider(song.Key,true);
        init(song);
        initialized = true;
        segments = getLyrics(song);
        renderLyrics(segments);
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  
        {
            $("#toolsCharm").width($("#toolsCharm").width() + 50)
        }
        if (showChordHints)
            $("chord").addClass("clickableChord");
        else $("chord").removeClass("clickableChord");
    }
    var curKey = song == null ? 0 : song.Key;
    //$("#lyricsDiv").css("margin-top", $("#lyricsHeader").css("height"));
    //$("#RightSliders").css("margin-top", $("#lyricsHeader").css("height"));
    $("#DataList").css("margin-top", $("#lyricsHeader").css("height"));


    var hh = $("#lyricsHeader").height();
if (hh < 55) hh = 10;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.listOffset { margin-top: ' + hh + 'px!important; } .tileOffset { margin-top:' + (hh + 12) + 'px!important}';
    document.getElementsByTagName('head')[0].appendChild(style);
   // if (parseInt(hh) > 53)
        $("#sTranspose").addClass('tileOffset');
    //if (parseInt(hh) > 53)
        $('#lyricsDiv').addClass('listOffset');

   init();
});
function init(song) {
    showChordHints = getSession("showChordHints") == "true" ? true : false;
    showChords = getSession("showChords") == "true" ? true : false;
    $("#ChordVisibility").prop("checked", showChords);
    $("#PopupChordHints").prop("checked", showChordHints);
    $("#PopupChordVisibility").prop("checked", showPopupChords);
    if (!showChords)                    // not showing chords at all
    {
        showPopupChords = false;        // can't show popup chords either
        showChordHints = false;         // or chord hints
        $("#PopupChordVisibility").attr("disabled", true);
        $("#PopupChordHints").attr("disabled", true);
        $("#PopupChordHints").attr("checked", false);
    }
    else
    {
        $("PopupChordVisibility").attr("disabled", false);
        $("#PopupChordHints").attr("disabled", false);
    }

    document.getElementById("PopupChordVisibility").checked = getSession("popupChords") == "true";

       document.getElementById("RightSliderVisibility").checked = getSession("rightSliders") == "true";
    if (getSession("rightSliders") == "true")
        $("#RightSliders").show();
    else $("#RightSliders").hide();
    showChords = getSession("showChords");
    $(".keyPad[data-key='" + (parent.song.Key) + "']").addClass("selected");
     
    var font = getSession("lyricFont");
    if (font == '"Courier New", Courier, monospace')
        $("#Courier").prop("checked",true);
    else $("#Lucida").prop("checked",true);

    createColorPickers();
    parent.adjustLyricsArea();
}


function keyIndex(key) {
    for (var i = 0; i < keyList.length; i++)
        if (keyList[i] == key)
            return i;
    return -1;
}


function changeFontSize(value, slider) {
    if (!initialized)
        return;
    setSession("lyricFontSize", value + "px");
    $(".lyricsDiv").css("font-size", value + "px");
}
