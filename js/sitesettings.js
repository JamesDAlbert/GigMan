"use strict";
var fonts = ['Georgia, serif', '"Palatino Linotype", "Book Antiqua", Palatino, serif', '"Times New Roman", Times, serif', 'Arial, Helvetica, sans-serif', '"Arial Black", Gadget, sans-serif'
    , '"Comic Sans MS", cursive, sans-serif', 'Impact, Charcoal, sans-serif', '"Lucida Sans Unicode", "Lucida Grande", sans-serif', 'Tahoma, Geneva, sans-serif', '"Trebuchet MS", Helvetica, sans-serif',
'Verdana, Geneva, sans-serif', '"Courier New", Courier, monospace', '"Lucida Console", Monaco, monospace'];
$(document).ready(function () {
    
    var a = [["color", "Text", "body"],["listRowBG","Row BG",".odd"],["listRowFG","Row FG",".odd"],["listAltRowBG","Alt. Row BG",".even"],["listAltRowFG","Alt. Row FG",".even"],
        ["tileBG","Tile BG",".myTile"],["tileFG","Tile FG",".myTile"]];
    var tbl = document.getElementById("siteColor");
    var tbl2 = document.getElementById("listColors");
    $("#sChangeFontSize").val(parseInt(localStorage.getItem("fontSize"), 10));
    $("#spChangeFontSize").val(parseInt(localStorage.getItem("fontSize"), 10));
    /*
    for (var i = a.length - 1; i > -1; i--) {
        var r;
        if (i == 0 && i%2 == 0)
            r = tbl.insertRow(0);
        else if (i % 2 == 0) r = tbl2.insertRow(0);
        var c1 = r.insertCell(0);
        var b = createColorPicker(a[i][0], a[i][1], a[i][2]);
        $(b).css({ "height": "30px" });
        c1.appendChild(b);
    }*/

    $("#SiteFonts option").remove(); // Remove all <option> child tags.
    $.each(fonts, function (index, item) { // Iterates through a collection
        var txt = item.split(",")[0].replace(/"/g,'');
        $("#SiteFonts").append( // Append an object to the inside of the select box
            $("<option></option>") // Yes you can do this.
                .text(txt)
                .val(item)
        );
    });
    $("#SongListLength").val(getLocal("songListLength"));
    $("#SetListLength").val(getLocal("setListLength"));
    $("#SiteFonts").val(getLocal("font"));
    $("#color").css({ "background-color": getLocal("color") });
    $("#boldText").prop("checked", getLocal("weight"));
    $("#italicText").prop("checked", getLocal("style"));
    $("#ignoreArticles").prop("checked", getLocal("ignoreArticles"));
    $("#colorScheme").prop("checked", getSession("colorscheme") == "highcontrast");

    var compColor = calculateForegroundColor(rgbFnToHex($("body").css("background-color")))
    $(".settingsTable").css({ "border" : "1px solid " + compColor });

    $("#SongListLength").change(function () {
        setLocal("songListLength", $("#SongListLength").val());
    });
    $("#SetListLength").change(function () {
        setLocal("setListLength", $("#SetListLength").val());
    });    

    $("#SiteFonts").change(function (e) {
        setLocal("font", $("#SiteFonts").val());
        $("body").css("font-family", $("#SiteFonts").val());
    });
    $("#boldText").on("click", function () {
        setLocal("weight", this.checked ? "bold" : "");
        $("body").css("font-weight", getLocal("weight"));
    });
    $("#italicText").on("click", function () {
        setLocal("style", this.checked ? "italic" : "");
        $("body").css("font-style", getLocal("style"));
    });
    $("#ignoreArticles").on("click", function () {
        setLocal("ignoreArticles", this.checked);
    });

    $("#sChangeFontSize").slider({
        orientation: "horizontal",
        max: 28,
        value: parseInt(getLocal("fontSize"),10),
        animate: "fast"
    });
    $("#sChangeFontSize").on("slide", function (ev, ui) {
        sliderChange(ev, ui)
    });
    
    $("#StorageUsed").text(localStorageSpace());
    $("#StorageRemaining").text("~" + (5000 - parseInt(localStorageSpace(),10) + " KB"));
});

function changeFontSize(value, slider) {
    setLocal("fontSize", value + "px");
    $("#" + slider[0].id + " .marker").text(value);
    $("body").css("font-size", value + "px");
}

