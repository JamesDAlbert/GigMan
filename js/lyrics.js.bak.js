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
var dividerColor = "#5090aa";
var initialized = false;
var notesChanged = false;
$(document).ready(function () {
    if (!checkLoginStatus())
        window.location.href = "default.html";
    showChords = getLocal("showChords") == "true";
    showPopupChords = getLocal("showPopupChords") == "true";
    superscriptChords = getLocal("superscriptChords") == "true";
    showChordHints = getLocal("showChordHints") == "true";
    var scheme = getSession("colorscheme");
    if (scheme == "highcontrast")
        $("#colorScheme").prop("checked", true);
    adjustLyricsArea();
    $(document).click(function (e) {
        if (e.target.parentElement.className == "songInfo")
            return;
        if ($("#SongInfo").is(":visible"))
        {
            $("#SongInfo").hide();
            e.preventDefault();
        }
    });

    $('#Notes').bind('input propertychange', function () {
        notesChanged = true;
    });

    $("#closeNotesPanel").on("click", function () {
        $("#notesPanel").hide();
        if (notesChanged) {
            song.Notes = $("#Notes").val();
            songSave(song);
        }
    });
    $("chord").on("click", function (e) {
        if (showChordHints)
        {
            e.preventDefault();
        }
    });
    $("#GoBack").click(function () {
        window.history.back();
    });

    $(".keyPad").click(function () {
        var keyStr = "";
        keyStr = $(this).data("key");
        $(".keyPad").removeClass("selected");
        $(this).addClass("selected");
        // $("#SongKey").html("Key - " + keyList[$(this).data("key")]);
        transposeChords($(this).data("key"));
    });
    $(document).on("click", ".lyricsBlock", function (a) {
        if ($(this)[0].open)
            $(this)[0].removeAttribute("open");
        else $(this)[0].open = true;
    });
    $(document).on("click", "summary", function (a) {
        if ($(this)[0].parentNode.open)
            $(this)[0].parentNode.removeAttribute("open");
        else $(this)[0].parentNode.open = true;
    });
    $("#ChordVisibility").click(function() {
        showChords = this.checked;
        setLocal("showChords", showChords);
        if (showChords)
            $("chordset").show();
        else $("chordset").hide();
    });
    $("#PopupChordHints").click(function() {
        setLocal("showChordHints", this.checked);
        showChordHints = this.checked;
    });
    $("#PopupChordVisibility").click(function() {
        showPopupChords = !showChordHints;
        if (showPopupChords) {
            $("chord").addClass("clickableChord");
            $("#PopupChordHints").prop("disabled", false);
        }
        else {
            $("chord").removeClass("clickableChord");
            $("#PopupChordHints").prop("checked", false);
            $("#PopupChordHints").prop("disabled", false);
            showChordHints = false;
        }
        setLocal("showPopupChords", showPopupChords);
    });
    $(".notesButton").click(function () {
        $("#notesPanel").draggable();
        if (!$("#notesPanel").is(":visible"))
            $("#notesPanel").show();
        else {
            $("#notesPanel").hide();
            if (notesChanged) {
                song.Notes = $("#Notes").val();
                songSave(song);
            }
        }
    });
    $(".songInfo").click(function (e) {
        e.preventDefault();
        $("#SongInfo").draggable();
        if (!$("#SongInfo").is(":visible"))
            $("#SongInfo").show();
        else $("#SongInfo").hide();
    });
    $("#RightSliderVisibility").click(function () {
        setLocal("rightSliders", this.checked);
        if (this.checked)
            $("#RightSliders").show();
        else $("#RightSliders").hide();
        adjustLyricsArea();
    });
    $("#IncPlayCount").click(function () {
        incrementSongCount(parms.a,parms.t);
    });
    $("#Courier").click(function () {
        $("#Lucida").prop("checked", false);
        setLocal("lyricFont", '"Courier New", Courier, monospace');
        $("#lyricsDiv").css("font-family", '"Courier New", Courier, monospace');
    });
    $("#Lucida").click(function () {
        $("#Courier").prop("checked", false);
        setLocal("lyricFont", '"Lucida Console", Monaco, monospace');
        $("#lyricsDiv").css("font-family", '"Lucida Console", Monaco, monospace');
    });
    var parms = getQueryParameters(document.location.search);
    /*
    data-role="slider"
                            data-on-change="changeFontSize"
                            data-accuracy="1"
                            data-max-value="28"
                            data-min-value="12"
                            data-animate="true"
                            data-complete-color="bg-gray" 
                            data-marker-color="buttonColor"
                            data-vertical="true"
                            data-show-hint="true"
    */
    
   $("#FontSize").on("input", function (ev, ui) {
        sliderChange(ev, ui)
    });
    $("#sChangeFontSize").slider({
        orientation: "vertical",
        min: 12,
        max: 28,
        value: parseInt(getLocal("lyricFontSize")),
        animate: "fast"
    });
    $("#sChangeFontSize").on("slide", function (ev, ui) {
        sliderChange(ev, ui)
    });
   
    if (parms.id != null)
    {
        song = songByID(parms.id,getActiveArtistID());


        song.ID = parseInt(song.ID);
        song.Key = parseInt(song.Key);
        $("#sTranspose").css("height", (window.innerHeight - 50) / 2);
        $("#sChangeFontSize").css("height", (window.innerHeight - 50) / 2);
        $("#FontSize").val(parseInt(getLocal("lyricFontSize")));
        $("#sChangeFontSize").slider("value", 100 * parseInt(getLocal("lyricFontSize")) / 28);

        $(".lyricsDiv").css("font-size", getLocal("lyricFontSize"));
        $("#lyricsDiv").css("font-size", getLocal("lyricFontSize"));
        $("#sTranspose").slider("value", 100 * song.Key);
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
    $("#sTranspose").slider({
        orientation: "vertical",
        min: 0,
        max: 11,
        value: parseInt(curKey),
        animate: "fast"
    });
    $("#sTranspose .marker").text(keyList[curKey]);
    $("#sTranspose").on("slide", function (ev, ui) {
        transpose(ev, ui)
    });
    if (song)
        $("#sTranspose .marker").text(keyList[song.Key]);
    $("#lyricsDiv").css("margin-top", $(".pageHeader").css("height"));
    $("#RightSliders").css("margin-top", $(".pageHeader").css("height"));
});

function adjustLyricsArea()
{
    if (getLocal("rightSliders") == "true") {
        $("#lyricsDiv").css("margin-left", "35px");
    }
    else $("#lyricsDiv").css("margin-left", "5px");
}

function init(song) {
    showChordHints = getLocal("showChordHints") == "true" ? true : false;
    showChords = getLocal("showChords") == "true" ? true : false;
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

    document.getElementById("PopupChordVisibility").checked = getLocal("popupChords") == "true";

    $("#sTranspose").data("slider").value(Math.floor(((song.Key)/12.0) * 100));
    $("#sTranspose .marker").text(keyList[song.Key]);
    $("#sChangeFontSize").data("position",parseInt(getLocal("lyricFontSize")));
    document.getElementById("RightSliderVisibility").checked = getLocal("rightSliders") == "true";
    if (getLocal("rightSliders") == "true")
        $("#RightSliders").show();
    else $("#RightSliders").hide();
    showChords = getLocal("showChords");
    $("#lyricsDiv").css("font-family", getLocal("lyricFont"));
    var lastPlayed = new Date(song.LastPlayed);
    if (lastPlayed.getFullYear() < 2000)
        lastPlayed = "n/a";
    else lastPlayed = pad(lastPlayed.getFullYear()) + "/" + pad(lastPlayed.getMonth()) + "/" + pad(lastPlayed.getDay() + 1);
    $("#SongInfo").html("<table class='songInfo'><tr><td>" + song.Title + "</td><td>" + "<a class='artistLink' data-artist='" + song.Artist + "'>" + song.Artist + "</a></td></tr>" + 
        "<tr><td>Key: </td><td>" + keyList[song.Key] + "</td></tr><tr><td>Last played: </td><td>" + lastPlayed + "</td></tr><tr><td>Genre: </td><td>" + genreNameFromID(song.Genre) + "</td></tr>" +
        "<tr><td>Category: </td><td>" + song.Category + "</td></tr><tr><td>Familiarity: </td><td>" + familiarityNameFromID(song.Familiarity) + "</td></tr><tr><td>Tempo: </td><td>" +
        tempoNameFromID(song.Tempo) + "</td></tr></table>"
        );
    // $("#SongKey").html("Key - " + keyList[song.Key]);
    $(".keyPad[data-key='" + (song.Key) + "']").addClass("selected");
     
    if (song.Notes != "")
    {
        $("#NotesTitle").text("Notes - " + song.Title);
        $("#Notes").text(song.Notes);
    }
    var font = getLocal("lyricFont");
    if (font == '"Courier New", Courier, monospace')
        $("#Courier").prop("checked",true);
    else $("#Lucida").prop("checked",true);
    
    if (song.Sample && song.Sample != "") {
        $("#PlaySample").attr("href", song.Sample);
        $("#PlaySample").attr("target", "_new");
    }
    else {
        $("#PlaySample").hide();
    }

    createColorPickers();
    adjustLyricsArea();
}

function getSegmentType(seg) {
    var fl = seg.split("\n")[0].trim().toLowerCase();
    switch (fl)
    {
        case "br":
        case "bridge":
            return "Bridge";
            break;
        case "ch":
        case "chorus":
            return "Chorus";
            break;
        default:
            return "Verse"
            break;
    }
}
function formatChords(line,chordType) {
    if (chordType == "AbovelineChords")
        return formatAbovelineChords(line);
    return formatEmbeddedChords(line);
}

// condition line if chords are embedded in lyrics
function formatEmbeddedChords(ln) {
    ln = ln.replace(/&nbsp;/g, ' ');
    var ary = ln.split(" ");
    var i = 0;
    var retVal = '';
    for (i = 0; i < ary.length; i++) {
        var wrd = "";
        if (ary[i].indexOf("|") == 0) {
            var val = ary[i].replace("|", "");
            wrd += "<chord class='chord embeddedChord' data-text='" + val.replace("&nbsp;","") + "' data-original-text='" + val.replace("&nbsp;","") + "' data-inlineChord='true'>" + val.replace("&nbsp;","") + "</chord> ";
        }
        else wrd = ary[i] + "&nbsp;";
        retVal += wrd;
    }

    return retVal;
}
// condition line if chords are above lyrics
function formatAbovelineChords(ln) {
    ln = ln.substring(1);
    ln = ln.replace(/&nbsp;/g, ' ');
    //ln = ln.replace(/\//g,' / ');
    var ary = ln.split(" ");
    var retVal = '';
    var i = 0;
    for (i = 0; i < ary.length; i++) {
        var val = ary[i];
        var wrd = val;

        if (val != "" && val != " " && (/^[a-gA-G]/.test(val)))
            wrd = "<chord class='chord' data-text='" + val + "' data-original-text='" + val + "' data-inlineChord='false'>" + val + "</chord>";
        if (i > 0)
            retVal += '&nbsp;';
        retVal += wrd;
    }

    return "<chordset>" + retVal + "<br/></chordset>";
}

function getLyrics(song) {
    var segs = song.Lyrics.split("\n\n");
    var segments = new Array();
    var altVerse = false;
    for (var i = 0; i < segs.length; i++) {
        if (segs[i][0] == '\n')
            segs[i] = segs[i].substring(1);
        var seg = {};
        seg.chordType = "None";
        seg.hintLineIndex = -1;
        seg.Collapsed = false;
        var segtype = getSegmentType(segs[i]);
        
        if (segtype == "Verse")
        {
            if (altVerse)
                segtype = "AlternateVerse";
            altVerse = !altVerse;
        }
        seg.Type = segtype;
        seg.lines = [];
        var lines = segs[i].split("\n");
        
        var hc = false;
        for (var j = 0; j < lines.length; j++) {
            if (lines[j][0] == "-")
                seg.Collapsed = true;
            var ln = lines[j].trim();
            if (ln.toLowerCase() == "chorus" || ln.toLowerCase() == "ch" || ln.toLowerCase() == "br" || ln.toLowerCase() == "bridge" ||
                ln.toLowerCase() == "v" || ln.toLowerCase() == "verse")
                continue;
            var line = {};
            if (ln.indexOf('~') > -1 ||  ln.indexOf("|") > -1)
            {
                hc = true; hasChords = true;
                line.isChords = true;
                if (ln.indexOf("|") > -1)
                    seg.chordType = "EmbeddedChords";
                else seg.chordType = "AbovelineChords";
                ln = formatChords(ln, seg.chordType);
            }
            else { hc = false; line.isChords = false; ln = ln.replace(/ /g, '&nbsp;');}
            line.line = ln;
            if (lines.length > 1 && ((j == 0 && seg.chordType == "None" || seg.chordType == "EmbeddedChords") || (j == 1 && seg.chordType == "AbovelineChords")))
                seg.hintLineIndex = j;// + (segtype=="Verse" ? 0 : 1);
            seg.lines.push(line);
        }
        if (seg.lines.length > 0)
            segments.push(seg);
    }
    return segments;
}
function renderLyrics(segments) {
    var lyrics = document.getElementById("lyricsDiv");
    lyrics.innerHTML = "";
    var inlineChords = false;
    for (var i = 0; i < segments.length; i++) 
    {
        if (segments[i].chordType == "EmbeddedChords")
            inlineChords = true;
        var lyricsBlock = document.createElement("details");
        if (!isChrome())
            lyricsBlock = document.createElement("p");
        lyricsBlock.id = "lyrics" + i;
        lyricsBlock.className = segments[i].Type + " lyricsBlock";
        if (segments[i].lines.length < 2)
            lyricsBlock.className += " nosummary";
        lyricsBlock.open = !segments[i].Collapsed;
        if (segments[i].lines.length > 1) {
            var hintLine = document.createElement("summary");
            hintLine.style.border = "none";
            if (segments[i].Collapsed)
                hintLine.style.fontWeight = "bold";
        }

        for (var j = 0; j < segments[i].lines.length; j++) 
        {
            var ln = segments[i].lines[j].line;
            if (!segments[i].lines[j].isChords || segments[i].chordType == "EmbeddedChords")
                ln += "<br/>";
            if (j <= segments[i].hintLineIndex && segments[i].lines.length > 1) {
                hintLine.innerHTML += ln;
                lyricsBlock.appendChild(hintLine);
            }
            else lyricsBlock.innerHTML += ln;           
        }
        if (segments[i].lines.length == 1)
        {
            lyricsBlock = document.createElement("p");
            lyricsBlock.innerHTML = segments[i].lines[0].line;
            lyricsBlock.className += "Verse lyricsBlock nosummary";
        }
        // add details to lyric window
        document.getElementById("lyricsDiv").appendChild(lyricsBlock);

        document.getElementById("lyricsDiv").appendChild(document.createElement("br"));
        // create dividers
        if (useDividers && i + 1 < segments.length)
        {
            var hr = document.createElement("hr");
            hr.style.height = dividerSize + "px";
            hr.style.border = "none";
            hr.style.backgroundColor = dividerColor;
            hr.className = "Divider";
            document.getElementById("lyricsDiv").appendChild(hr);
        }
    }
    $("chord").each(function () {
        var ch = $(this).data("text");
        if (superscriptChords) {
            ch = superscript(ch);
            if (inlineChords)
                ch += "&nbsp;";
        }
        $(this).html(ch, true);
    });
    alterColorScheme();
    modifyStyles();
}
// superscript chord decorations (m, sus, 7...)
function superscript(ch, supressTag) {
    var st = 1;
    //if (/[^a-zA-Z0-9]/.test(ch))
    //    return ch;
    ch = ch.replace("&nbsp;", " ");

    if (st < ch.length) {
        ch = ch.substring(0, st) + "<sup>" + ch.substring(st) + "</sup>";
    }
    if (ch.indexOf("|") == -1) {
        if (!supressTag)
            ch = ch.replace("</chord>", "");
    }
    ch = ch.replace(" ", "&nbsp;");
    return ch;
}

function transposeChords(idx) {
    var key = song.Key;
    var offset = (idx) - key;
    var spWdth = $("#spc").width() / 2;

    $("chord").each(function (idx) {
        var ch = $(this).data("original-text");
        var len = 1;
        if (ch.indexOf("b") > -1 || ch.indexOf("#") > -1)
            len = 2;
        var c = ch.substring(0, len); // chord note
        var c2idx = keyList.indexOf(c) + offset;
        if (c2idx < 0) c2idx = 12 + c2idx;
        if (c2idx > 11) c2idx = c2idx - 12;
        var c2 = keyList[c2idx];
        var ch2 = ch.replace(c, c2);
        if (ch2 == "A#") ch2 = "Bb";
        $(this).data("text", ch2);
        if ($(this).data("inlinechord") == true)
            ch2 += "&nbsp;";

        if (superscriptChords)
            ch2 = superscript(ch2);
        if ($(this).data("inlinechord") == false) {
            if ($(this).data("text").length > $(this).data("original-text").length)
                $(this).css('margin-left', -spWdth);
            else if ($(this).data("text").length < $(this).data("original-text").length)
                $(this).css('margin-left', spWdth);
        }
        $(this).html(ch2);
    });
}

function keyIndex(key) {
    for (var i = 0; i < keyList.length; i++)
        if (keyList[i] == key)
            return i;
    return -1;
}

function transpose(value, slider) {
    if (!initialized)
        return;
    var keyStr = "";
    if (value > -1) keyStr = keyList[value];
    $("#" + slider.attr("id") + " .slider-hint").text(keyStr);
    // $("#SongKey").html("Key - " + keyList[value]);
    $("#" + slider[0].id + " .marker").text(keyStr);
    transposeChords(value);
}
function changeFontSize(value, slider) {
    if (!initialized)
        return;
    setLocal("lyricFontSize", value + "px");
    $("#" + slider[0].id + " .marker").text(value);
    $(".lyricsDiv").css("font-size", value + "px");
}
