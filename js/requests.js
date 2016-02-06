$(document).ready(function () {
    var art = JSON.parse(sessionStorage.getItem("artist"));
    var nReqs = checkRegistry(art.UserID, "irequests", art.MaxiRequests);
    if (nReqs == art.MaxiRequests) {
        $("#message").html(art.ArtistName + " thanks you for using GigMan Request!<br/>Please note that you can make a total of " + art.MaxiRequests + " requests for this artist once in a 24 hour period.");
        $(".requests").hide();
        $("#listData").hide();
    }
    else {
        $("#message").html("");
        $(".requests").show();
        $("#listData").show();
        for (var i = 1; i <= art.MaxiRequests - nReqs; i++)
            $("#r" + i).show();
    }
    var dta = songListPublic(art.ArtistID);
    if (dta.length == 0) {
        $("#otherCharm").data("charm").open();
        document.getElementById("contentContainer").src = "nodata.html";
        disableRequests = true;
        $("#requestLink").css("text-decoration", "none");
        //return;
    }
    songList = $('#SongList').DataTable({
        "aaData": dta,
        orderClasses: true,
        "sDom": "<'toolbar'>ft",
        paging: false,
        responsive: true,
        "bAutoWidth": true,
        fixedHeader: true,
        "sScrollY": "500px",
        "oLanguage":
        {
            "sSearch": "<span class='mif-search' title='Search for a title or artist'></span>",
            searchPlaceholder: "Search Title/Artist"
        },
        "columnDefs": [

        {
            "orderable": false, "width": "25px", "targets": 0, "render": function (value, type, full) {
                return "<a class='songVoteLink songUpVoteLink' href='#' data-id='" + full.ID + "' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "' data-title='" + escape(encodeURI(reverseArticle(full.Title))) + "'><span class='mif-thumbs-up mif-black'></span></a>";
            }
        },

        {
            "orderable": true, "width": "295px", "targets": 1, "render": function (value, type, full) {
                return "<a class='songLink' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "' data-title='" + escape(encodeURI(reverseArticle(full.Title))) + "'>" + full.Title + "</a>";
            }
        },
        {
            "orderable": true, "width": "295px", "targets": 2, "render": function (value, type, full) {
                return "<a class='artistLink' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "'>" + full.Artist + "</a>";
            }
        },
        {
            "orderable": true, "width": "295px", "targets": 3, "render": function (value, type, full) {
                return "<a class='categoryLink' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "'>" + full.Category + "</a>";
            }
        },
        {
            "orderable": false, "targets": 4, "width": "25px", "visible": art.EnableDownvotes === true, "render": function (value, type, full) {
                return "<a class='songVoteLink songDownVoteLink' href='#' data-id='" + full.ID + "' data-artist='" + escape(encodeURI(reverseArticle(full.Artist))) + "' data-title='" + escape(encodeURI(reverseArticle(full.Title))) + "'><span class='mif-thumbs-down mif-black'></span></a>";
            }
        },
        ]
    });
    $("div.toolbar").html('<button class="button small-button" id="submitButton"><span class="mif-checkmark"></span> Done!</button>').css({ "margin-bottom": "-38px", "width": "150px" });
    if (!art.ShowCategories)
        songList.column(3).visible(false);
    if (!art.ShowArtist)
        songList.column(2).visible(false);
    $(document).on("click", "#submitButton", function () {
        var rqs = [];
        $("#requestMessage").text("");
        $(".requestContainer").each(function (i, value) {
            var s = $(value).find(".requestSong")[0].innerText;
            if (s.trim() != "") {
                iRequestCreate(art.ArtistID, $(this).data("id"), $(this).data("vote"),ip);
                nReqs++;
            }
        });
        if (nReqs == 0) {
            $("#requestMessage").text("You haven't selected any songs to request!");
            return;
        }
        addRegistry(art.UserID, "irequests", nReqs);
        $("#message").text("Thanks from " + art.ArtistName + " for using GigMan Request!");
        $(".requests").hide();
        $("#listData").hide();
    });

});