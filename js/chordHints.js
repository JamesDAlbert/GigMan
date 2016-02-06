"use strict";
var chordLatched = false,
    chordPosition = 1,
    currentChord = "";
    
$(document).ready(function () {
    $(document).on("click", "#closeJTabDialog", function () {
        $("#jTabDialog").hide("slow");
    });

    $(document).click(function (e) {
        if (!showChordHints)
            return;
        if (chordLatched && e.target.localName != "chord" && e.target.localName != "svg") {
            e.preventDefault();
            currentChord = "";
            chordLatched = false;
            $("#chordViewer").hide();
            chordPosition = 1;
            return;
        }
    });

    $(document).on("click", ".chord", function (e) {
        if (!showChordHints)
            return;
        e.preventDefault();
        if (chordLatched) {
            currentChord = "";
            chordLatched = false;
            $("#chordViewer").hide();
            chordPosition = 1;
            return;
        }
        chordLatched = true;
        currentChord = this.innerText;
        $("#chordViewer").css("left", e.pageX + 10 + "px");
        $("#chordViewer").css("top", e.pageY + 10 + "px");
        loadChordView(this.innerText);
    });

    $(document).on("mouseenter mouseleave", ".chord", function (e) {
        if (!showChordHints)
            return;
        if (chordLatched) return;
        e.preventDefault();
        $("#chordViewer").css("left", e.pageX + 10 + "px");
        $("#chordViewer").css("top", e.pageY + 10 + "px");
        if (this.innerText)
            loadChordView(this.innerText);
        else
        {
            loadChordView(this.innerHTML.replace("<sup>","").replace("</sup>",""));
        }
    });
    $(document).on("mouseleave", "chord", function (e) { if (!chordLatched) $("#chordViewer").hide() });


    $(document).on("click", "#chordViewer", function () {
        if (!showChordHints)
            return;
        chordPosition++;
        if (chordPosition > 3) chordPosition = 1;
        loadChordView(currentChord);
    });
});

function loadChordView(chord) {
    chord = chord.replace("M7", "maj7");
    var ch = chord.charAt(0).toUpperCase() + chord.slice(1);
    if (ch.indexOf("/") > -1) ch = ch.substring(0, ch.indexOf("/"));
    var root = ch;
    var wdth = 75;
    $('#chordViewer').show();
    {
        ch = ch + ":" + chordPosition;
        wdth = 150;
    }
    $('#chordViewer').width(wdth);
    jtab.render($('#chordViewer'), ch);
}
$(document).on("click", "#jTabLink", function () {
    showJTab();
});
function showJTab() {
    $("#jTabDialog").html(jtab.Strings.AboutDialog);
    $("#jTabDialog").show("slow");
}
function setChordHints(val)
{
    showChordHints = val;
}