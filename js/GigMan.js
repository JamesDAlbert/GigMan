/*global document*/
"use strict";

var loggedIn;
var scheme = getSession("colorscheme");

    if (scheme == "hic") {
        $('link[id="gmStyle"]').attr('href', 'css/gigman-hic.min.css');
    }
    else if (scheme == "classic")
    {
        $('link[id="gmStyle"]').attr('href', 'css/gigman-classic.min.css');
    }
    else if (scheme == "neon")
    {
        $('link[id="gmStyle"]').attr('href', 'css/gigman-neon.min.css');
    }
    else {
        $('link[id="gmStyle"]').attr('href', 'css/gigman-neon.min.css');
        setSession("colorscheme", "neon");
    }
$(document).ready(function () {
    loggedIn = checkLoginStatus();

    if (!loggedIn && window.location.href.indexOf("default.html") < 0
        && window.location.href.toLowerCase().indexOf("ad.html")  < 0
        && window.location.href.toLowerCase().indexOf("ads.html") < 0
        && window.location.href.toLowerCase().indexOf("faq.html") < 0
        && window.location.href.toLowerCase().indexOf(".html") > 0) {
        window.location.href = "default.html";
        return;
    }
    else {
        try
        {
            $("body").css("font-size",getSession("fontSize"));
            $("html").css("font-size",getSession("fontSize"));
        }
        finally
        {

        }
    }

    setColorSchemeSwitch(scheme);
    var art = JSON.parse(getSession("activeartist"));
    if (art) $("#iRequestURL").text(iRequestLocation + art.iRequestName);
    if (checkLoginStatus())
        $("title").text("GigMan - " + getActiveArtistName());
    $("#ListType .slide-switch").css("width", "33px");
    if (loggedIn)
        checkUIDefaults();
    $(document).on("click", "#clearAllMessages", function () {
        var id = $(this).data("userid");
        iRequestMessagesDelete(id);
    });
    $(document).on("click", ".messageDelete", function () {
        var id = $(this).data("messageid");
        iRequestMessageDelete(id);
    });
    $("#Login").keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            login($("#Username").val(), $("#Password").val());
        }
    });
    $("#Login").click(function () {
        login($("#Username").val(), $("#Password").val());      
    });
    
    $("#closePaletteWindow").on("click", function () {
        if ($("#paletteWindow")[0].style.display == "none")
            return;
        $("#paletteWindow").hide();
    });
    $(document).on("click", ".paletteEntry", function (e) {
        if ($("#paletteWindow")[0].style.display == "none")
            return;
        e.preventDefault();
        var b = document.getElementById($("#paletteWindow").data("source"));
        b.style.backgroundColor = this.style.backgroundColor;
        $("#paletteWindow").hide();
        setSession(b.id, this.style.backgroundColor);
        var attr = "color";
        if ($(b).data("element").toLowerCase().indexOf("background") > -1)
            attr = "background-color"
        $($(b).data("element")).css(attr, getSession(b.id));
        if (window.parent.adjustLyricsArea) window.parent.adjustLyricsArea();
    })
    $(document).on("click", ".paletteButton", function (e) {
        $(".selectedPaletteButton").removeClass("selectedPaletteButton");
        $(this).addClass("selectedPaletteButton");
        if ($("#paletteWindow")[0].style.display != "none")
        { $("#paletteWindow").hide(); }
        var w = $("#paletteWindow");
        $("#paletteTable").empty();
        var p = createPalette($(this).data("element"));
        $("#paletteWindow").draggable();
        w.data("source", (this).id);
        var y = e.clientY;
        if ((parseInt(w.css("height"),10) + y) > window.innerHeight)
            y = (window.innerHeight - parseInt(w.css("height"),10));
        w.css("top", y - 20 + "px");
        w.css("left", e.clientX + "px");
        w.show();       
    });
    $(document).on("click", "#Search", function () {
        var trm = $("#SearchTerm").val();
        parent.window.location = "list.html?v=s&a=" + encodeURI(trm);
    });
    $(document).on("click",".navigationPanel .tile-content",(function () {
        var page = "", type = "", arg = "";
        switch ($(this).attr("id")) {
            case "Resynch":
                if (getUserID() == 5)
                    return;
                if (!$("#Resynch").hasClass("disabled")) {
                    var usr = getSession("loggedinuser");
                    var cs = getSession("colorscheme");
                    clearSession();

                    // save any song edits
                    saveSongListEdits(JSON.parse(getLocal("songlist")));
                    clearLocal();
                    setSession("loggedinuser", usr);
                    setSession("colorscheme", cs);
                    checkUIDefaults(true);
                    parent.location.reload();
                }
                break;
            case "WantAds":
                page = "WantAds.html";
                break;
            case "Credits":
                page = "credits.html";
                break;
            case "songList":
                page = "list.html";
                type = "song";
                break;
            case "Setlists":
                page = "setlist.html";
                break;
            case "FAQ":
                page = "faq.html";
                break;
            case "index":
                page = "index.html";
                break;
            case "Artists":
                page = "list.html";
                type = "as";
                break;
            case "Genres":
                page = "list.html";
                type = "gs";
                break;
            case "Categories":
                page = "list.html";
                type = "cs";
                break;
            case "SongEditor":
                var aid = getActiveArtistID();
                if (!aid || aid.Error || aid < 1) {
                    return;
                }
                var charm = $("#editorCharm").data("charm");
                $("#editorCharm").find("iframe").prop("src", "songeditor.html");
                if (charm == null) {
                    parent.showCharm("#editorCharm");
                    return;
                }
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
            case "RandomSong":
                var dta = getMasterSongList();
                if (!dta || dta.Error || dta.length < 1)
                    return;
                var idx = parseInt(dta.length * Math.random(),10);
                parent.window.location = "lyrics.html?id=" + dta[idx].ID;
                break;
            case "RandomArtist":
                var aid = getActiveArtistID();
                if (!aid || aid < 1)
                    return;
                var dta = songArtists(aid);
                if (!dta || dta.Error || dta.length < 1)
                    return;
                var idx = parseInt(dta.length * Math.random(),10);
                page = "list.html"
                type = "a";
                arg = "&a=" + dta[idx].Name;
                break;
            case "Unplayed":
                page = "list.html"
                type = "o";
                break;
            case "Profiles":
                page = "profiles.html"
                break;
            case "Calendar":
                if ($("#Calendar").hasClass("disabled"))
                    page = "";
                else page = "calendar.html";
                break;
            case "Announcements":
                if ($("#Announcements").hasClass("disabled"))
                    page = "";
                else page = "announcements.html";
                break;
            case "Dashboard":
                if ($("#Dashboard").hasClass("disabled"))
                    page = "";
                else page = "dashboard.html";
                break;
            case "Logout":
                var ip = getClientIP(), userID = getUserID(), data = getSessionData(), userAgent = navigator.userAgent;
                saveUserSession(userID, ip, data, userAgent);
                clearSession();
                window.location.href="default.html"
                break;
            case "Settings":
                charm = $("#settingsCharm").data("charm");
                if (!charm)
                    charm = $($($(parent.window)[0].document.getElementById("settingsCharm"))[0]).data("charm");
                $("#settingsCharm").find("iframe").prop("src", "sitesettings.html");
                if (charm == null) {
                    parent.showCharm("#settingsCharm");
                    return;
                }
                if (charm.element.data("opened") === true) {
                    charm.close();
                } else {
                    charm.open();
                }
                break;
        }
        if (page != "") parent.window.location = page + "?v=" + type + arg;
    }));
    $("#Logout").click(function () {
        var ip = getClientIP(), userID = getUserID(), data = getSessionData(), userAgent = navigator.userAgent;
        saveUserSession(userID, ip, data, userAgent);
        clearSession();
        window.location.href = "default.html"
    });
    $("#Home").click(function () {
        window.location.href = "index.html"
    });
    $(document).on("click", ".scrollButton", function () {
        var amt = window.innerHeight - 35;
        if ($(this).data("direction") == "up")
            amt = -amt;
        window.scrollBy(0, amt);
    });
    $(document).on("click", ".helpButton", function () {
        var topic = $(this).data("topic");
        document.getElementById("helpContainer").src = "help/" + topic + "_help.html";
        var charm = $("#helpCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
    });
    $(document).on("click", "#CloseHelpPanel", function () {
        $("#helpCharm").data("charm").close();
    });
    $(document).on("click", "#OpenToolsPanel", function () {
            var charm = $("#navigationCharm").data("charm");
            charm.close();
            charm = $("#toolsCharm").data("charm");
            $("#lyricToolsContainer").attr("src", "lyricsettings.html");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $(document).on("click", "#CloseToolsPanel", function () {
            var charm = $("#toolsCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $(document).on("click","#OpenSidePanel", function () {
            var charm = $("#navigationCharm").data("charm");
            $("#navigationCharm").find("iframe").prop("src", "navpanel.html");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $(document).on("click","#CloseSidePanel", function () {
            var charm = $("#navigationCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $("#OpenEditorPanel").on("click", function () {
            var charm = $("#navigationCharm").data("charm");
            charm.close();
            charm = $("#editorCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $("#OpenSetEditorPanel").on("click", function () {
            var charm = $("#navigationCharm").data("charm");
            charm.close();
            charm = $("#setEditorCharm").data("charm");
            $("#setEditorContainer").attr("src", "setlisteditor.html");

            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $("#CloseEditorPanel").on("click", function () {
            var charm = $("#editorCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $("#CloseSetEditorPanel").on("click", function () {
            var charm = $("#setEditorCharm").data("charm");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $(".CloseSettingsPanel").on("click", function () {
            var charm = $("#settingsCharm").data("charm");
           
            $("#settingsCharm").find("#settingsContainer").prop("src", "sitesettings.html");
            if (charm.element.data("opened") === true) {
                charm.close();
            } else {
                charm.open();
            }
        });
        $(document).on("click",".songDeleteLink", function(e) {
            songDelete($(this).data("songid"));
            e.preventDefault();
            var sl = JSON.parse(getLocal("songlist"));
            for (var i = 0; i < sl.length; i++)
            {
                if (sl[i].ID == $(this).data("songid"))
                {
                    sl.splice(i, 1);
                    break;
                }
            }
            setLocal("songlist", JSON.stringify(sl));

            var tbl = $("#SongList", window.parent.document).dataTable();
            if (tbl) {
                var os = tbl.fnSettings();
                tbl.fnClearTable(this);
                for (var i = 0; i < sl.length; i++)
                    tbl.oApi._fnAddData(os, sl[i]);
                os.aiDisplay = os.aiDisplayMaster.slice();
                tbl.fnDraw();
            }

            parent.location.reload();
        });
        $(document).on("click",".songLink", function() {
            parent.window.location = "lyrics.html?id=" + $(this).data("songid");
        });
        $(document).on("click",".artistLink", function(e) {
            parent.window.location = "list.html?v=a&a=" + $(this).data("artist");
            e.preventDefault();
        });
         $(document).on("click",".genreLink", function() {
            parent.window.location = "list.html?v=g&g=" + $(this).data("genre");
         });
         $(document).on("click",".categoryLink", function() {
            parent.window.location = "list.html?v=c&c=" + $(this).data("category");
         });
         $(document).on("click",".genreTile", function() {
            window.location = "list.html?v=g&g=" + $(this).data("genre");
         });
         $(document).on("click",".categoryTile", function() {
            window.location = "list.html?v=c&c=" + $(this).data("category");
         });
         $(document).on("click",".artistTile", function() {
            window.location = "list.html?v=a&a=" + $(this).data("artist");
         });
         $(document).on("click", ".songTile", function (e) {
             if (e.target.className == "artistLink")
             {
                    parent.window.location = "list.html?v=a&a=" + $(this).data("artist");
                    return;
             }
             if ($("#editorCharm").data("charm").element.data("opened"))
                 return;
             window.location = "lyrics.html?id=" + $(this).data("songid");
             e.preventDefault();
         });
         $(document).on("click",".songEditLink",function (e) {
             var charm = $("#editorCharm").data("charm");
             
             if (charm == null)
                 return;
             if (charm.element.data("opened") === true) {
                 var s1 = JSON.parse(getLocal("editSong"));
                 if (!s1 || (s1.Title == unescape(decodeURI($(this).data("title"))) && s1.Artist == unescape(decodeURI($(this).data("artist")))))
                    charm.close();
             } else {
                 charm.open();
                 fillEditor(songByID($(this).data("songid")));
                 e.preventDefault();
             }
         });
         $(document).on(".myModernInput", "input", function () {
            if (this.children[0].value.trim() != "")
                 this.children[3].style.display = "none";
             else this.children[3].style.display = "";
         });
         $(".myModernInput").change(function () {
             if (this.children[0] && this.children[0].value)
                 if (this.children[0].value.trim() != "") {
                     if (this.children[3])
                     this.children[3].style.display = "none";
                 }
                 else this.children[3].style.display = "";
         });

         $(".spinMinus").on("mousedown touchstart", function () {
             var tt = $(this).next()[0].id;
             
                 var val = $("#" + tt).val();
                 var min = $("#" + tt).data("min");
                 val -= $("#" + tt).data("step");
                 if (val < min)
                     val = min;
                 $("#" + tt).val(val).change();
                 setSession($("#" + tt).data("field"), val + "px");
                 if ($("#" + tt).data("field") == "fontSize") {
                     jss.set("body", { "font-size": val + "px!important" });
                     jss.set(".SongList A", { "font-size": val + "px!important" });                    
                 }
             else if ($("#" + tt).data("field") == "lyricFontSize") {
                     $("#sChangeFontSize").slider("value",val);
                     $("#lyricsDiv").css("font-size", val + "px!important");
                 }
                 if (parent.adjustLyricsArea) parent.adjustLyricsArea();
             return false;
         });
         $(".spinPlus").on("mousedown touchstart", function () {
             var tt = $(this).prev()[0].id;

                 var val = $("#" + tt).val();
                 var max = $("#" + tt).data("max");
                 val++;
                 if (val > max)
                     val = max;
                 $("#" + tt).val(val).change();
                 setSession($("#" + tt).data("field"), val + "px");
                 if ($("#" + tt).data("field") == "fontSize") {
                     jss.set("body", { "font-size": val + "px" });
                     jss.set("SongList A", { "font-size": val + "px" });
                 }
                 else if ($("#" + tt).data("field") == "lyricFontSize") {
                     $("#sChangeFontSize").slider("value", val);
                     $("#lyricsDiv").css("font-size", val + "px!important");
                 }
                 if (parent.adjustLyricsArea) parent.adjustLyricsArea();
             return false;
         });
         $(document).on("mouseup touchend", ".spinPlus, .spinMinus", function () {

             modifyStyles();
             return false;
         });
         $("#ColorScheme input").on("click", function (e) {
             e.preventDefault();
             var sch = $(this).val();
             setColorSchemeSwitch(sch);
         });
         $("#EventVisibility .slide-switch-input").on("click", function (e) {
             e.preventDefault();
             var sch = $(this).val();
             setEventVisibilitySwitch(sch);
         });
         $("#ListType .slide-switch-input").on("click", function (e) {
             e.preventDefault();
             var sch = $(this).val();
             setListTypeSwitch(sch);
         });
         $("#LyricFontFace .slide-switch-input").on("click", function (e) {
             e.preventDefault();
             var f = $(this).val();
             $("#Lucida").prop("checked", false);
             setSession("lyricFont", f);
             $("#lyricsDiv").css("font-family", f);
             setFontFaceSwitch(f);
             parent.init();
         });
         $(".pageHeader, .indexHeader").dblclick(function (e) {
             e.preventDefault();
             location.reload();
         });
         $("#GoBack").click(function () {
             window.history.back();
         });
         if (loggedIn) {
             //modifyStyles();
         }
});
function getSessionData() {
    var x = [];
    for (var i = 0; i < sessionStorage.length; i++)
    {
        var y = {key:sessionStorage.key(i),data:getSession(sessionStorage.key(i))};
        x.push(y);
    }
    return JSON.stringify(x);
}

function setEventVisibilitySwitch(sch) {
    $("#EventVisibility .slide-switch-label").removeClass("switch-selected");
    var ss = "css/gigman-";
    $("#EventVisibility .slide-switch-marker").removeClass("slide-switch-marker-current");

    switch (sch) {
        case "0":
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-right");
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-middle");
            $("#EventVisibility .slide-switch-selection").addClass("slide-switch-left");
            $("#EventVisibility .slide-switch-label-left span").addClass("slide-switch-marker-current");
            ss += "hic.min.css";
            $("#EventVisibility").data("evtvisibility", "0");
            break;
        case "1":
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-left");
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-right");
            $("#EventVisibility .slide-switch-selection").addClass("slide-switch-middle");
            $("#EventVisibility .slide-switch-label-left").addClass("switch-selected");
            $("#EventVisibility .slide-switch-label-middle span").addClass("slide-switch-marker-current");
            ss += "neon.min.css";
            $("#EventVisibility").data("evtvisibility", "1");
            break;
        case "2":
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-middle");
            $("#EventVisibility .slide-switch-selection").removeClass("slide-switch-left");
            $("#EventVisibility .slide-switch-selection").addClass("slide-switch-right");
            $("#EventVisibility .slide-switch-label-left").addClass("switch-selected");
            $("#EventVisibility .slide-switch-label-middle").addClass("switch-selected");
            $("#EventVisibility .slide-switch-label-right span").addClass("slide-switch-marker-current");
            ss += "classic.min.css";
            $("#EventVisibility").data("evtvisibility", "2");
            break;
    }
}
function setFontFaceSwitch(f)
{
    $("#LyricFontFace .slide-switch-label").removeClass("switch-selected");
    $("#LyricFontFace .slide-switch-marker").removeClass("slide-switch-marker-current");
    switch (f) {
        case "'Courier New', Courier, monospace":
            $("#LyricFontFace .slide-switch-selection").removeClass("slide-switch-middle");
            $("#LyricFontFace .slide-switch-selection").addClass("slide-switch-left");
            $("#LyricFontFace .slide-switch-label-left span").addClass("slide-switch-marker-current");
            $("#LyricFontFace").data("fontface", f);
            break;
        case "'Lucida Console', Monaco, monospace":
            $("#LyricFontFace .slide-switch-selection").removeClass("slide-switch-left");
            $("#LyricFontFace .slide-switch-selection").addClass("slide-switch-middle");
            $("#LyricFontFace .slide-switch-label-right span").addClass("slide-switch-marker-current");
            $("#LyricFontFace").data("fontface", f);
            break;
    }
    setSession("lyricFont",f);// '"Courier New", Courier, monospace');
    $("#lyricsDiv").css("font-family", f);//'"Courier New", Courier, monospace');
}
function setListTypeSwitch(sch) {
    $("#ListType .slide-switch-label").removeClass("switch-selected");
    $("#ListType .slide-switch-marker").removeClass("slide-switch-marker-current");
    switch (sch) {
        case "list":
            $("#ListType .slide-switch-selection").removeClass("slide-switch-middle");
            $("#ListType .slide-switch-selection").addClass("slide-switch-left");
            $("#ListType .slide-switch-label-left span").addClass("slide-switch-marker-current");
            $("#ListType").data("listtype", "list");
            break;
        case "tile":
            $("#ListType .slide-switch-selection").removeClass("slide-switch-left");
            $("#ListType .slide-switch-selection").addClass("slide-switch-middle");
            $("#ListType .slide-switch-label-left").addClass("switch-selected");
            $("#ListType .slide-switch-label-right span").addClass("slide-switch-marker-current");
            $("#ListType").data("listtype", "tile");
            break;
    }
}
function setColorSchemeSwitch(sch) {
    if (sch == null)
        sch = "classic";
    $("#ColorScheme .slide-switch-label").removeClass("switch-selected");
    var ss = "css/gigman-";
    $("#ColorScheme .slide-switch-marker").removeClass("slide-switch-marker-current");

    switch (sch) {
        case "hic":
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-right");
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-middle");
            $("#ColorScheme .slide-switch-selection").addClass("slide-switch-left");
            $("#ColorScheme .slide-switch-label-left span").addClass("slide-switch-marker-current");
            ss += "hic.min.css";
            $("#ColorScheme").data("scheme","hic");
            break;
        case "neon":
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-left");
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-right");
            $("#ColorScheme .slide-switch-selection").addClass("slide-switch-middle");
            $("#ColorScheme .slide-switch-label-left").addClass("switch-selected");
            $("#ColorScheme .slide-switch-label-middle span").addClass("slide-switch-marker-current");
            ss += "neon.min.css";
            $("#ColorScheme").data("scheme","neon");
            break;
        case "classic":
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-middle");
            $("#ColorScheme .slide-switch-selection").removeClass("slide-switch-left");
            $("#ColorScheme .slide-switch-selection").addClass("slide-switch-right");
            $("#ColorScheme .slide-switch-label-left").addClass("switch-selected");
            $("#ColorScheme .slide-switch-label-middle").addClass("switch-selected");
            $("#ColorScheme .slide-switch-label-right span").addClass("slide-switch-marker-current");
            ss +="classic.min.css";
            $("#ColorScheme").data("scheme","classic");
            break;
    }
    $('link[id="gmStyle"]').attr('href', ss);
    $("#gmStyle", parent.document.head).attr("href", ss);

    var ifr = $("iframe").add($("iframe", parent.document));
    $(ifr).each(function (i,f) {
        var idoc = (f.contentDocument) ? f.contentDocument : f.contentWindow.document;
        if (idoc.getElementById("gmStyle")) {
            if (f.id == "helpContainer") ss = iRequestURL + ss;
            idoc.getElementById("gmStyle").href = ss;
        }
    });
    if (getSession("loggedinuser"))
        setSession("colorscheme", sch);
    return ss;
}
function login(username, password) {
    var usr = userLogin(username, password);
    if (usr.Error) {
        $("#loginError").text("There was an error logging in.  Please ensure that your user name and password are spelled correctly");
    }
    else {
        var sess = getUserSession(getUserID());
        setUserSession(sess);
        checkUIDefaults();
        window.location.href = "index.html";
    }
}
function setUserSession(session)
{
    var sl = session.length;
    if (sl < 2)
        return;
    var x = JSON.parse(session[session.length-1].Data);
    for (var i = 0; i < x.length; i++)
    {
        setSession(x[i].key, x[i].data);
    }
}

function fillEditor(song) {
    var frm = frames["editorContainer"];
    frm.popEd(song);
}
function setSetlistEditor(set, subset)
{
    $(document.getElementById('editorContainer').contentWindow.document.getElementById("SetName")).val(set).change();
    $(document.getElementById('editorContainer').contentWindow.document.getElementById("SubsetName")).val(subset).change();
}
function sliderChange(ev, ui) {
    var val = ui.value;
    //$("#val").text(keys[val]);
    var vmin = $(ev.target).slider("option", "min"),
        vmax = $(ev.target).slider("option", "max")
    var left = 100 * (ui.value - vmin) / (vmax - vmin);
    var right = 100 * (ui.value - vmin) / (vmax - vmin);
    $(ev.target).css('background-image', '-webkit-linear-gradient(bottom, #00aba9 ' + left + '%,#45fffd  ' + right + '%)');
}

    function fontSliderToInput(value, slider) {
        $('#FontSizeValue').val(value);
        setSession("font-size", value);
    }
    function pcSliderToInput(value, slider) {
        $('#PlayCountValue').val(value);
        var table = $("#SongList").dataTable();
    }
    function dataSort(dta, type) {
        var ignoreArticles = getSession("ignorearticles") == "true";
        dta = dta.sort(function (a, b) {
            var res = 0;
            if (type == "song") {
                if (ignoreArticles) {
                    if (a.Title.toLowerCase().indexOf("the ") == 0) {
                        a.Title = a.Title.substring(4) + ",The";
                    }
                    if (a.Title.toLowerCase().indexOf("a ") == 0) {
                        a.Title = a.Title.substring(2) + ",A";
                    }
                    if (a.Title.toLowerCase().indexOf("an ") == 0) {
                        a.Title = a.Title.substring(3) + ",An";
                    }
                    // composers
                    if (a.Artist.toLowerCase().indexOf("the ") == 0) {
                        a.Artist = a.Artist.substring(4) + ",The";
                    }
                    if (a.Artist.toLowerCase().indexOf("a ") == 0) {
                        a.Artist = a.Artist.substring(2) + ",A";
                    }
                    if (a.Artist.toLowerCase().indexOf("an ") == 0) {
                        a.Artist = a.Artist.substring(3) + ",An";
                    }
                }
                return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0);
            }
            else {
                if (ignoreArticles) {
                    if (a.Name.toLowerCase().indexOf("the ") == 0) {
                        a.Name = a.Name.substring(4) + ",The";
                    }
                    if (a.Name.toLowerCase().indexOf("a ") == 0) {
                        a.Name = a.Name.substring(2) + ",A";
                    }
                    if (a.Name.toLowerCase().indexOf("an ") == 0) {
                        a.Name = a.Name.substring(3) + ",An";
                    }
                }
                return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0);
            }
        });
        return dta;
    }

    function getMasterSongList()
    {
        var lst = JSON.parse(getLocal("songlist"));
        if (!lst || lst.length < 1)
            lst = songListAll(getActiveArtistID());

        if (getSession("ignorearticles") === "true")
        {
            lst = dataSort(lst, "song");
        }
        return lst.sort(function (a, b) { return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0); });
    }
    function modifyStyles() {
        jss.set("body", { "font-size": getSession("fontSize") });
        jss.set("html", { "font-size": getSession("fontSize") });
        jss.set("table.display tr.odd.myTableRowClass",{ "background-color": getSession("listRowBG") });
        jss.set("table.display tr.odd.myTableRowClass",{ "color": getSession("listRowFG") });
        jss.set("table.display tr.even.myTableRowClass",{ "background-color": getSession("listAltRowBG") });
        jss.set("table.display tr.even.myTableRowClass",{ "color": getSession("listAltRowFG") });
        jss.set(".SongList.odd",{ "color": getSession("listAltRowFG"), "background-color": getSession("listAltRowBG") });
        jss.set(".SongList.even",{ "color": getSession("listRowFG"), "background-color": getSession("listRowBG") });
    }
    function check(key,local) {
        var r = [];
        if (local)
            r = getLocal(key);
        else r = getSession(key);
        if (r == null || r == "null")
            return false;
        return true;
    }

       
    function checkUIDefaults(useRemote) {
        if (getUserID() < 1)
            return;
        $("body").show();
        var ul = useLocalStorage;
        if (useRemote)
            useLocalStorage = false;
        if (getSession("lyricBackgroundColor") == null)
            setSession("lyricBackgroundColor", "black");
        if (getSession("embeddedChordBackgroundColor") == null)
            setSession("embeddedChordBackgroundColor", "black");
        if (getSession("lyricFont") == null)
            setSession("lyricFont", '"Courier New", Courier, monospace');
        if (getSession("showChords") == null)
            setSession("showChords", "true");
        if (getSession("showPopupChords") == null)
            setSession("showPopupChords", "true");
        if (getSession("rightSliders") == null)
            setSession("rightSliders", "false");
        if (getSession("lyricFontSize") == null || parseInt(getSession("lyricFontSize")) < 12)
            setSession("lyricFontSize", "18px");
        if (getSession("dividerColor") == null)
            setSession("dividerColor", "#5090aa");
        if (getSession("verseColor") == null)
            setSession("verseColor", "lime");
        if (getSession("alternateVerseColor") == null)
            setSession("alternateVerseColor", "aqua");
        if (getSession("chorusColor") == null)
            setSession("chorusColor", "yellow");
        if (getSession("bridgeColor") == null)
            setSession("bridgeColor", "white");
        if (getSession("chordColor") == null)
            setSession("chordColor", "white");
        if (getSession("showChordHints") == null)
            setSession("showChordHints", "true");
        if (getSession("color") == null)
            setSession("color", "#ffff99");
        if (getSession("font") == null)
            setSession("font", "Arial");
        if (getSession("weight") == null)
            setSession("weight", "");
        if (getSession("style") == null)
            setSession("style", "");
        if (getSession("fontSize") == null)
            setSession("fontSize", "18px");
        if (getSession("tileBG") == null)
            setSession("tileBG", "teal");
        if (getSession("tileFG") == null)
            setSession("tileFG", "white");

        if (getSession("listRowBG") == null)
            setSession("listRowBG", "teal");
        if (getSession("listRowFG") == null)
            setSession("listRowFG", "white");
        if (getSession("listAltRowBG") == null)
            setSession("listAltRowBG", "black");
        if (getSession("listAltRowFG") == null)
            setSession("listAltRowFG", "white");
        if (getSession("tileBG") == null)
            setSession("tileBG", "teal");
        if (getSession("tileFG") == null)
            setSession("tileFG", "white");

        if (getSession("songListStyle") == null)
            setSession("songListStyle", "list");
        if (getSession("gListStyle") == null)
            setSession("gListStyle", "list");
        if (getSession("csListStyle") == null)
            setSession("csListStyle", "list");
        if (getSession("aListStyle") == null)
            setSession("aListStyle", "list");
        if (getSession("asListStyle") == null)
            setSession("asListStyle", "list");
        if (getSession("gsListStyle") == null)
            setSession("gsListStyle", "list");
        if (getSession("cListStyle") == null)
            setSession("cListStyle", "list");
        if (getSession("setListStyle") == null)
            setSession("setListStyle", "list");
        if (getSession("ignorearticles") == null)
            setSession("ignorearticles", "false");
        if (getSession("songListLength") == null)
            setSession("songListLength", "-1");
        if (!check("tempolist",false) || useRemote)
        {
            setSession("tempolist",JSON.stringify(tempos()));
        }
        if (!check("genrelist",false) || useRemote)
        {
            setSession("genrelist",JSON.stringify(genres()));
        }
        if (!check("familiaritylist",false) || useRemote)
        {
            setSession("familiaritylist",JSON.stringify(familiarities()));
        }
        if (!check("keylist",false) || useRemote)
        {
            setSession("keylist",JSON.stringify(keys()));
        }
        if (!check("songlist",true) || useRemote)
        {
            useLocalStorage = false;
            var sl = getMasterSongList();
            setLocal("songlist",JSON.stringify(sl));
        }
        else
        {
            sl = JSON.parse(getLocal("songlist"));
            if (sl.length == 0)
            {
                var ul = useLocalStorage;
                useLocalStorage = false;
                var sl = getMasterSongList();
                setLocal("songlist", JSON.stringify(sl));
                useLocalStorage = ul;
            }
        }
        useLocalStorage = ul;

    }

    function createColorPicker(id, name, elet) {
        $(elet).css("color", getSession(id));
        var bgc = getSession(id);
        var b = document.createElement("button");
        b.className = "paletteButton";
        b.id = id;
        $(b).data("element", elet);
        b.style.color = calculateForegroundColor(bgc);
        b.style.backgroundColor = bgc;
        b.title = "Choose color for " + name + "."
        $(b).text(name);
        b.style.width = "100%";
        b.style.height = "100%";
        b.style.margin = "3px";
        return b;
    }

    function createColorPickers() {
        var a = [["dividerColor", "Lyric Dividers", ".Divider"], ["verseColor", "Verse", ".Verse"], ["alternateVerseColor", "Alt. Verse", ".AlternateVerse"], ["chorusColor", "Chorus", ".Chorus"],
            ["bridgeColor", "Bridge", ".Bridge"], ["lyricBackgroundColor", "Background", ".LyricsBackground"],["chordColor","Chords", ".chord"],
            ["embeddedChordBackgroundColor", "Emb. Chd. Background", ".embeddedChord"]];
        var tbl = document.getElementById("colors");
        var r;// = tbl.insertRow(0);
        for (var i = 0; i <= a.length - 1; i++) {
            if ((i % 2) == 0)
                r = tbl.insertRow(0);
            var c1 = r.insertCell(0);
            c1.style.width = "50%";
            r.style.height = "50%";
            c1.style.padding = "3px"
            c1.appendChild(createColorPicker(a[i][0], a[i][1], a[i][2]))
        }
    }

