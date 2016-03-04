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
    
    $("#sTranspose").slider({
        range: "min",
        max: 11,
        min: 0,
        animate: "fast",
        orientation: "vertical",
        change: function () {
            var value = $("#sTranspose").slider("option", "value");
            setKeySlider(value);
            transpose(value);
        },
        slide: function () {
            var value = $("#sTranspose").slider("option", "value");
            setKeySlider(value);
            transpose(value);
        }
    });
    $("#sChangeFontSize").slider({
        range: "min",
        max: 28,
        min: 12,
        animate: "fast",
        orientation: "vertical",
        change: function () {
            var value = $("#sChangeFontSize").slider("option", "value");
            setFontSlider(value);
            $("#lyricsDiv").css({ "font-size": value + "px" });
        },
        slide: function () {
            var value = $("#sChangeFontSize").slider("option", "value");
            setFontSlider(value);
            $("#lyricsDiv").css({"font-size": value + "px" });

        }
    });
    if (!checkLoginStatus())
        window.location.href = "default.html";
    showChords = getSession("showChords") == "true";
    showPopupChords = getSession("showPopupChords") == "true";
    superscriptChords = getSession("superscriptChords") == "true";
    showChordHints = getSession("showChordHints") == "true";
    var scheme = getSession("colorscheme");
    if (scheme == "highcontrast")
        $("#colorScheme").prop("checked", true);
    adjustLyricsArea();
    $(document).click(function (e) {
        if (e.target.parentElement.className.indexOf("songInfo") > -1)
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
        setSession("showChords", showChords);
        if (showChords)
            $("chordset").show();
        else $("chordset").hide();
    });
    $("#PopupChordHints").click(function() {
        setSession("showChordHints", this.checked);
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
        setSession("showPopupChords", showPopupChords);
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
        setSession("rightSliders", this.checked);
        if (this.checked)
            $("#RightSliders").show();
        else $("#RightSliders").hide();
        adjustLyricsArea();
    });
    $("#IncPlayCount").click(function () {
        incrementSongCount(parms.a,parms.t);
    });

    var parms = getQueryParameters(document.location.search);

    
   $("#FontSize").on("input", function (ev, ui) {
        sliderChange(ev, ui)
   });

   $("#collapseHeader").click(function () {
       if (parseInt($("#lyricsHeader").css("height")) < 55)
            $("#lyricsHeader").css("height", 55);
       else $("#lyricsHeader").css("height", 20);
       adjustChrome();
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

    adjustChrome();
   
});
function adjustChrome() {
    var hh = $("#lyricsHeader").height();
    //$("#lyricsHeader").css({ "line-height": hh, "vertical-align": "top" });
    if (hh <= 55) hh = 0;
    if (hh > 60) hh -= 55;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.listOffset { margin-top: ' + hh + 'px!important; } .tileOffset { margin-top:' + (hh) + 'px!important}';
    document.getElementsByTagName('head')[0].appendChild(style);
    $("#lyricsWrapper").addClass("tileOffset");
    hh = window.innerHeight - $("#lyricsHeader").height() - getScrollbarWidth() - 1;
    $(".toolSliders").css("height", hh);
    $("#sTranspose").css("height", (hh / 2) - 15);
    $("#sChangeFontSize").css("height", (hh / 2) - 15);
}

function setFontSlider(val, set) {
    $("#sChangeFontSize").find(".ui-slider-handle").text(val);
    if (set)
        $("#sChangeFontSize").slider("value", val);
    setSession("lyricFontSize", val);
}
function setKeySlider(val, set) {
    $("#sTranspose").find(".ui-slider-handle").text(keyList[val]);
    if (set)
        $("#sTranspose").slider("value", val);
}
function adjustLyricsArea()
{
    var f = getSession("lyricFont");
    setFontFaceSwitch(f);
    if (getSession("rightSliders") == "true") {
        $("#lyricsDiv").css("padding-left", "40px");
    }
    else $("#lyricsDiv").css("padding-left", "5px");
    jss.set("#lyricsDiv", { "margin-top": $(".pageHeader").css("height") + "!important" });
    jss.set(".Verse", { "color": getSession("verseColor") });
    jss.set(".AlternateVerse", { "color": getSession("alternateVerseColor") });
    jss.set(".Bridge", { "color": getSession("bridgeColor") });
    jss.set(".Chorus", { "color": getSession("chorusColor") });
    jss.set(".Divider", { "background-color": getSession("dividerColor") });
    jss.set(".lyricsDiv", { "background-color": getSession("lyricBackgroundColor") }, { "font-size": getSession("lyricFontSize") + " !important" }, { "font-family": getSession("lyricFont") });
    jss.set(".LyricsWrapper", { "background-color": getSession("lyricBackgroundColor") + " !important" });
    jss.set(".LyricsBackground", { "background-color": getSession("lyricBackgroundColor") + " !important" });
    jss.set(".lyricsBlock", { "background-color": getSession("lyricBackgroundColor") }, { "font-size": getSession("lyricFontSize") + " !important" }, { "font-family": getSession("lyricFont") });
    jss.set(".embeddedChord", { "background-color": getSession("embeddedChordBackgroundColor") });
    jss.set(".chord", { "color": getSession("chordColor") });
    jss.set(".LyricsBackground", { "background-color": getSession("lyricBackgroundColor") });
    jss.set("toolSliders", { "background-color": getSession("lyricBackgroundColor") });
}

function init(song) {
    if (!song) song = songByID(getQueryParameters(document.location.search).id, getActiveArtistID());
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

    //document.getElementById("PopupChordVisibility").checked = getSession("popupChords") == "true";

    setKeySlider(song.key);
   
    setFontSlider(parseInt(getSession("lyricFontSize")));
    //document.getElementById("RightSliderVisibility").checked = getSession("rightSliders") == "true";
    if (getSession("rightSliders") == "true")
        $("#RightSliders").show();
    else $("#RightSliders").hide();
    showChords = getSession("showChords");
    $("#lyricsDiv").css("font-family", getSession("lyricFont"));
    var lastPlayed = new Date(song.LastPlayed);
    if (lastPlayed.getFullYear() < 2000)
        lastPlayed = "n/a";
    else lastPlayed = pad(lastPlayed.getFullYear()) + "/" + pad(lastPlayed.getMonth()) + "/" + pad(lastPlayed.getDay() + 1);
    var art = JSON.parse(getSession("activeartist"));
    $("#SongInfo").html("<table class='songInfo'><tr><td colspan='2' style='text-align:center'>" + song.Title + "<br/>" + "<a class='artistLink' data-artist='" + song.Artist + "'>" + song.Artist + "</a></td></tr>" + 
        "<tr><td>Key :&nbsp;</td><td>&nbsp;" + keyList[song.Key] + "</td></tr><tr><td>Last played :&nbsp;</td><td>&nbsp;" + lastPlayed + "</td></tr><tr><td>Genre :&nbsp;</td><td>&nbsp;" + genreNameFromID(song.Genre) + "</td></tr>" +
        "<tr><td>Category :&nbsp;</td><td>&nbsp;" + song.Category + "</td></tr><tr><td>Familiarity :&nbsp;</td><td>&nbsp;" + familiarityNameFromID(song.Familiarity) + "</td></tr><tr><td>Tempo :&nbsp;</td><td>&nbsp;" +
        tempoNameFromID(song.Tempo) + "</td></tr><tr><td colspan='2' style='text-align:center!important;padding:5px'><label id='iRequestURL'>" + iRequestLocation + art.iRequestName + "</label>" + "</td></tr></table>"
        );
    // $("#SongKey").html("Key - " + keyList[song.Key]);
    $(".keyPad[data-key='" + (song.Key) + "']").addClass("selected");
     
    if (song.Notes != "")
    {
        $("#NotesTitle").text("Notes - " + song.Title);
        $("#Notes").text(song.Notes);
    }
    var font = getSession("lyricFont");
    if (font == '"Courier New", Courier, monospace')
        $("#Courier").prop("checked",true);
    else $("#Lucida").prop("checked",true);
    
    if (song.Sample && song.Sample != "") {
        $("#PlaySample").attr("href", song.Sample);
        $("#PlaySample").attr("target", "_new");
    }
    else {
        $("#PlaySample").css("disabled",true);
    }

    //createColorPickers();
    adjustLyricsArea();
}

function getSegmentType(seg) {
    var fl = seg.split("\n")[0].trim().toLowerCase().replace(":","");
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
    var segs = song.Lyrics.replace(/\r\n/g, "\n").split("\n\n");//song.Lyrics.split("\n\n");
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

    transposeChords(value);
}
function changeFontSize(value, slider) {
    if (!initialized)
        return;
    setSession("lyricFontSize", value + "px");
    $(".lyricsDiv").css("font-size", value + "px");
}
