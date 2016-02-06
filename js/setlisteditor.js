"use strict";
var sngCnt = 1, setCnt = 1, ssCnt = 1, sets;
var setLists;
var songs = [];
$(function () {
    setLists = getAllSetlists();
    var chHght = parseInt(getLocal("fontSize"));
    var sicn = "images/note.png";
    var setIcn = "images/list.png";
    var ssIcn = "images/check.png";
    var allIcn = "images/library.png";

    if (getSession("colorscheme") == "highcontrast") {
        sicn = "images/note-inv.png";
        setIcn = "images/list-inv.png";
        ssIcn = "images/check-inv.png";
        allIcn = "images/library-inv.png";
    }
    else if (getSession("colorscheme") == "neon")
    {
        sicn = "images/note-inv.png";
        setIcn = "images/list-inv.png";
        ssIcn = "images/check-inv.png";
        allIcn = "images/library-inv.png";
    }


    if (getSession("colorscheme") == "highcontrast")

    $('#sets').bind("loaded.jstree", function (event, data) {
        sets.jstree("open_all");
    });
    sets = $('#sets').jstree({
        "core": {
            data: setLists,
            "themes": {
                "icons": true
            },
            "check_callback": true,
            //"dblclk_toggle": false
        },
        "plugins": ["dnd", "types", "contextmenu"],
        "types": {
            "default": {
                "icon": allIcn,
                "valid_children": ["set"]
            },
            "song": {
                "icon": sicn,
                "valid_children": ["nothingatall"]
            },
            "subset": {
                "icon": ssIcn,
                "valid_children": ["song", "default"]
            },
            "set": {
                "icon": setIcn,
                "valid_children": ["subset"]
            }
        },
        "contextmenu": {
            items: customMenu
        }
    });

    sets.bind("dblclick.jstree", function (e, data) {
        var node = $(e.target).closest("li");
        var id = node[0].id; //id of the selected node
        if (id.indexOf("song_") > -1) {
            var ttl = node[0].innerText.split(": ")[0],
                art = node[0].innerText.split(": ")[1];
            id = node[0].id.substring(5);
            window.location = "lyrics.html?id=" + id;
        }
    });
    var songs = getMasterSongList();
    /*
    var sngTbl = $('#sSongList').DataTable({
        "oLanguage": {
            "sEmptyTable" : "There are no songs in the songlist.",
            "sSearch":""
        },
        "aaData": songs,
        paging: false,
        //scrollY: screen.availHeight - (12 * chHght),
        orderClasses: false,
        "bDestroy": false,
        "bFilter": false,
        "sDom": 'ft',
        "bLengthChange": false,
        responsive: true,
        "aoColumnDefs": [
        {
            "bVisible": false, "aTargets": 0, className: "songTitle", "mRender": function (value, type, full) {
                return "<span class='ID'>" + full.ID + "</span>";
            }, "visible": true, "searchable": true
        },
        {
            "aTargets": 1, className: "songTitle", "mRender": function (value, type, full) {
                return "<a class='songLink' data-songid='" + full.ID + "' data-artist='" + reverseArticle(full.Artist) + "' data-title='" + reverseArticle(full.Title) + "'>" + full.Title + "</a>";
            }
        },
        {
            "aTargets": 2, className: "songTitle", "mRender": function (value, type, full) {
                return "<a class='artistLink' data-artist='" + reverseArticle(full.Artist) + "'>" + full.Artist + "</a>";
            }
        },
    });*/




    var sngTbl = $('#sSongList').dataTable({
            "aaData": songs,
            "bPaginate": false,
            "paging": false,
            "bDestroy": false,
            "sPaginationType": "simple_numbers",
            orderClasses: false,
            "sDom": 'fBt',
            "bLengthChange": false,
            responsive: true,
            fixedHeader: { header: true },
            "offsetTop": 43,
            "oLanguage": {
                "sEmptyTable": "There are no songs in the song list.",
                "sSearch": ""
            },
            "aoColumnDefs": [
            {
                "bVisible": false,"className":"songTitle", "aTargets": 0, className: "songTitle", "mRender": function (value, type, full) {
                    return "<span class='ID'>" + full.ID + "</span>";
                }, "visible": true, "searchable": true
            },
            {
                "aTargets": 1,"className":"songTitle", "mRender": function (value, type, full) {
                    return "<a class='songLink' data-songid='" + full.ID + "'>" + full.Title + "</a>";
                }
            },
            {
                "aTargets": 2,"className":"songTitle", "mRender": function (value, type, full) {
                    return "<a class='artistLink' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "'>" + full.Artist + "</a>";
                }
            }
            ],
        });


    $(sngTbl.fnGetNodes()).draggable({
        opacity: 0.7,
        helper: function (event, ui) {
            var d = sngTbl.fnGetData(sngTbl.fnGetPosition(this));
            var ttl = d.Title,
                art = d.Artist,
                id = d.ID;
            return $('<span data-id="' + id + '" data-title="' + ttl + '" data-artist="' + art + '" style="white-space:nowrap;color:black;background-color:white"/>').text(ttl + " " + art);
        },
        cursorAt: { left: 5, top: 5 },
        cursor: "move",
        connectToSortable: '#sets',
        start: function (event, ui) { $(this).css("z-index", 100); }
    });


    $(document).on("dnd_stop.vakata", function (e, data) {
        if (data.data.jstree) {
            var $row = sngTbl.find(".selected");
            var i = 0;
            parent = data.event.target;
            if (typeof data.data.nodes[0] == "string") // this is a song, dragged via COPY (CTL-Drag) from within the tree
            {
                /* e.preventDefault();
                 var node = { type: "song", id: "song_" + (++sngCnt), class: "song", text: data.element.innerText + "!!!" };
                 $('#sets').jstree().create_node(parent, node, 'last');*/
                return true;
            }
            $.each($row, function (k, v) {
                if (i > 0) {
                    var ttl = v.cells[1].innerText;
                    var art = v.cells[2].innerText,
                        id = v.cells[0].innerText;

                    var node = { type: "song", id: "song_" + (id), class: "song", text: ttl + ": <i class='treeArtist'>" + art + "</i>" };
                    $('#sets').jstree().create_node(parent, node, 'last');
                }
                i++;
            });
        }
    });

    $('.songTitle')
    .on('mousedown', function (e) {
        var ttl = e.target.parentElement.cells[0].innerText,
            art = e.target.parentElement.cells[1].innerText;
        var id = sngTbl.fnGetData(sngTbl.fnGetPosition(this)[0]).ID;
        var r = $.vakata.dnd.start(e,
            { 'jstree': true, 'obj': $(this), 'nodes': [{ id: "song_" + (id), text: ttl + ": <i class='treeArtist'>" + art + "</i>", type: "song" }], "type": "song" },
            '<div id="jstree-dnd" class="song"><i class="jstree-icons jstree-er"></i>' + ttl + '</div>');
        return r;
    });

    $('#sSongList').selectable({
        filter: 'tr',
        stop: function () {
            $(".ui-selected", this).each(function () {
                var index = $("#sSongList tr").index(this) - 1;
                $('#sSongList tbody tr:eq(' + index + ')').toggleClass('row-selected');
                $('#sSongList tbody tr:eq(' + index + ')').toggleClass('ui-selected');
            });
        }
    });

    $('#sSongList tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
    });

    $('#eSetList tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
    });





    $(".dataTables_filter").css("margin", "5px");
    $("input[type=search]").attr("placeholder", "Enter Search term");
    $(".dataTables_filter input").css("float", "right").css("margin-right", "5px");






});
function hideColumn(idx)
{
    // Get the column API object
    var column = $("#sSongList").DataTable().column(idx);
    // Toggle the visibility
    var width = $('#tableContainer').width();
    var parentWidth = $('#tableContainer').offsetParent().width();
    var pct = 100 * width / parentWidth;
    if (!column.visible()) {
        pct += 10;
    }
    else {
        pct -= 10;
    }
    $("#tableContainer").css("width", pct + "%");
    column.visible(!column.visible());
    $("#tableContainer").css("width", pct + "%");
}
function customMenu(node) {
    // The default set of all items
    var type = "";
    if (node.id == "setsRoot" || node.id.indexOf("set_") == 0)
        type = "set";
    if (node.id.indexOf("subset_") == 0)
        type = "sub-set";
    if (node.id.indexOf("song_") == 0)
        type = "song";
    var items = {
        renameItem: { // The "rename" menu item
            "separator_before": false,
            "separator_after": false,
            "_class": "setlist_menu",
            "icon":false,
            label: "Rename " + type,
            action: function () { if (!node.data) node.data = node.text.toString();doRename(this, node); }
        },
        deleteItem: { // The "delete" menu item
            "separator_before": false,
            "separator_after": false,
            "_class": "setlist_menu",
            "icon":false,
            label: "Delete " + type,
            action: function () { doDelete(this, node); }
        },
        createItem: {
            "separator_before": false,
            "separator_after": false,
            "_class": "setlist_menu",
            "icon":false,
            label: "Create a new " + type,
            action: function () { doCreate(this, node); }
        },
        /*copyItem: {
            label: "Copy " + type,
            action: function () { doCopy(this, node); }
        },*/
        saveSetlist: {
            "separator_before": false,
            "separator_after": false,
            "_class": "setlist_menu",
            "icon":false,
            label: "Save Setlist",
            action: function () { saveList(node); }
        }
    };

    if (node.id == "setsRoot") {
        items.deleteItem = null;
        items.renameItem = null;
        items.copyItem = null;
        items.saveSetlist = null;
    }
    else if (node.id.indexOf("song_") > -1 || node.id.indexOf("subset_") > -1) {
        items.createItem = null;
        if (node.id.indexOf("song_") > -1)
            items.renameItem = null;
    }
    else if (node.id.indexOf("song_") > -1) {
        items.renameItem = null;
    }
    if (node.id.indexOf("set_") != 0)
        items.saveSetlist = null;
    return items;
}
function doCreate(e, n) {
    if (n.id == "setsRoot") {
        setCnt++;
        parent = n.id;
        var node = { type: "set", a_attr: { "title": "Right click to add a sub-set" }, id: "set_" + (++setCnt), class: "set", text: "New set" };
        $('#sets').jstree().create_node(parent, node, 'last');
    }
    else if (n.id.indexOf("set_") == 0) {
        ssCnt++;
        parent = n.id;
        var node = { type: "subset", a_attr: { "title": "Drag a song from the left-hand list onto this sub-set" }, id: "subset_" + (++ssCnt), class: "set", text: "New subset" };
        $('#sets').jstree().create_node(parent, node, 'last');
    }
}
function saveList(root) {
    var v = $("#sets").jstree(true).get_json('#' + root.id, { 'flat': false });
    var setName = v.text;
    if (root.data)
    {
        setlistDelete(root.data, '', getUserID());
    }
    for (var i = 0; i < v.children.length; i++)                  // for each subset
    {
        var subSetName = v.children[i].text;
        var songs = [];
        for (var j = 0; j < v.children[i].children.length; j++) // for each song
        {
            var id = parseInt(v.children[i].children[j].id.substring(5));
            songs.push({ SongID: id, Ordinal: j })
        }
        setlistSave(setName, subSetName, songs, getActiveArtistID());
    }
}
function doRename(e, obj) {
    $("#sets").jstree(true).edit(obj);
}

function doDelete(e, obj) {
    $("#sets").jstree(true).delete_node(obj);
}

function doCopy(e, obj) {
    $("#sets").jstree(true).copy_node(obj);
}

function getAllSetlists() {
    var ssId = 1;
    var sl = setlists(getActiveArtistID());
    var setLists = [];
    for (var i = 0; i < sl.length; i++) {
        var children = extractSubsets(sl[i], subsets(sl[i], getActiveArtistID()), i);
        ssId += children.length;
        var s = { text: sl[i], a_attr: { "title": "Right click to add a sub-set" }, id: "set_" + (i + 1), children: children, "type": "set", class: "set" };
        setLists.push(s);
    }
    setCnt = sl.length;
    return { text: "<span class='root'>All Sets</span>", id: "setsRoot", children: setLists, type: "root", "class": "masterRoot" };
}

function extractSubsets(s, ss, id) {
    var a = [];
    for (var i = 0; i < ss.length; i++) {
        var children = getSongs(s, ss[i]);//.SubsetName);
        var ch = { text: ss[i], id: "subset_" + id + "_" + i, "type": "subset", attributes: { class: "subset" }, children: children };
        a.push(ch);
    }
    ssCnt += ss.length;
    return a;
}

function getSongs(s, ss) {
    var a = setlist(s, ss, getActiveArtistID());
    var sngs = [];
    var ml = getMasterSongList();
    for (var i = 0; i < a.Songs.length; i++) {
        var sng = jlinq.from(ml).equals("ID", a.Songs[i].SongID).select();
        if (sng.length > 0) {
            sng = sng[0];
            var txt = sng.Title + ": <i class='treeArtist'>" + sng.Artist + "</i>";
            var ch = { text: txt, id: "song_" + sng.ID, "type": "song", attributes: { class: "song" } }
            sngs.push(ch);
            sngCnt++;
        }
    }
    return sngs;
}