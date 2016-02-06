"use strict";
var artistList, art, isAdmin = false;
$(document).ready(function () {
    getArtistList();
    var rates = getRates();
    
    if (rates)
    {
        $("#GMMonth").text("$" + jlinq.from(rates).equals("Name", "GigManMonthlyRate").select()[0].Value);
        $("#PremiumMonthPayButton").data("amount",jlinq.from(rates).equals("Name", "GigManMonthlyRate").select()[0].Value)
        $("#GMYear").text("$" + jlinq.from(rates).equals("Name", "GigManYearlyRate").select()[0].Value);
        $("#PremiumYearPayButton").data("amount",jlinq.from(rates).equals("Name", "GigManYearlyRate").select()[0].Value)
        $("#IRMonth").text("$" + jlinq.from(rates).equals("Name", "iRequestMonthlyRate").select()[0].Value);
        $("#iRequestMonthPayButton").data("amount", jlinq.from(rates).equals("Name", "iRequestMonthlyRate").select()[0].Value)
        $("#IRYear").text("$" + jlinq.from(rates).equals("Name", "iRequestYearlyRate").select()[0].Value);
        $("#iRequestYearPayButton").data("amount", jlinq.from(rates).equals("Name", "iRequestYearlyRate").select()[0].Value)
    }
    $(document).on("click", ".removeMember", function () {
        var artID = $(this).data("artistid"), usr = $(this).data("userid");
        artistMemberDelete(artID, usr);
        populateMemberList(artistMembers(art.ArtistID));
    });
    $("#SaveArtistProfile").click(function () {
        art.ShowArtist = $("#ShowArtist").prop("checked");
        art.ShowCategories = $("#ShowCategories").prop("checked");
        art.ShowMembers = $("#ShowMembers").prop("checked");
        art.EnableDownvotes = $("#EnableDownvotes").prop("checked");
        art.MaxiRequests = $("#maxRequests").val();
        art.MaxiMessages = $("#maxMessages").val();
        art.Public = $("#PublicListing").prop("checked");
        art.iRequestName = $("#iRequestName").val();
        art.Genres = $("#MyGenres option").map(function () {
            return $(this).val();
        }).get().join();
        artistSave(art.ArtistID, art.ArtistName, art.Website, art.UserID, art.ShowCategories, art.ShowArtist, art.ShowMembers,
            art.EnableDownvotes, art.MaxiMessages, art.MaxiRequests, art.Public,art.iRequestName, art.Genres);
    });
    $("#Artists").change(function () {
        populateForm();
    });
    $(document).on("click", ".approve", function () {
        $(".error").text("");
        var rid = $(this).data("requestid");

        if (!$(".artistRole[data-requestid='" + rid + "']").val()) {
            $(".error").text("Please select an artist role.");
            return;
        }
        var mssg = $(".message[data-requestid='" + rid + "']").val();
        var role = $(".artistRole[data-requestid='" + rid + "']").val();
        joinRequestProcess(rid, 1, mssg, role.join(","));
        populateMemberList(artistMembers(art.ArtistID));
        getJoinRequests(art);
    });
    $(document).on("click", ".deny", function () {
        var rid = $(this).data("requestid");
        var mssg = $(".message[data-requestid='" + rid + "']").val();
        var role = $(".artistRole[data-requestid='" + rid + "']").val();
        processJoinRequest(rid, 0, mssg, role);
        populateMemberList(getMembersByArtistID(art.ArtistID));
        getJoinRequests(art);
    });
    $("#Move").click(function (e) {
        var selectedOpts = $('#Genres option:selected');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#MyGenres').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });
    $("#Remove").click(function (e) {
        var selectedOpts = $('#MyGenres option:selected');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#Genres').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });
    $("#Checkout").click(function () {
        //if ($("#PremiumMonthPayButton").prop("checked"))

    });
    $(".gm-checkbox.payment").click(function () {
        var p = calcPrice().toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
        $("#paymentTotal").text(p);
    });
});
function calcPrice() {
    var price = 0;
    $("input[type=radio]:checked").each(function (i, el) {
        price += +$(el).data("amount");
    });
    return price;
}

function populateGenres(g) {
    var gnr = genres();
    var opts = "";
    for (var i = 0; i < gnr.length; i++) {
        if (g.indexOf(gnr[i].ID) < 0)
            $("#Genres").append("<option value='" + gnr[i].ID + "'>" + gnr[i].Name + "</option>");
    }

}
function populateMyGenres() {
    $("#MyGenres").find("option").remove();
    var art = JSON.parse(sessionStorage.getItem("activeartist"));
    var gnrs = art.Genres.split(",");
    for (var i = 0; i < gnrs.length; i++) {
        $("#MyGenres").append("<option value='" + gnrs[i] + "'>" + getGenreName(gnrs[i]) + "</option>");
    }
    return gnrs;
}
function getGenreName(id) {
    var gnr = genres();
    for (var i = 0; i < gnr.length; i++)
        if (gnr[i].ID == id)
            return gnr[i].Name;
    return "";
}
function getArtistList() {
    artistList = artistListByUserID(getUserID());
    for (var i = 0; i < artistList.length; i++) {
        var o = "<option value='" + artistList[i].ArtistID + "'>" + artistList[i].ArtistName + "</option>";
        $("#Artists").append(o);
    }
    populateForm();
}
function populateForm() {
    if (!$("#Artists").val())
        return;
    art = artistByID($("#Artists").val());
    if (!art || art.Error)
        return;
    if (!art)
        return;
    var bVal = false;
    if (art.UserID == getUserID())
        isAdmin = true;
    if (getUserID() != art.UserID || !art.iRequestMember)
        bVal = true;
    if (getUserID() != art.UserID)
        $("#iRequestPayment").hide();
    $("#PremiumMonthPayButton").prop("disabled", art.PremiumMember);
    $("#PremiumYearPayButton").prop("disabled", art.PremiumMember);

    $("#iRequestMonthPayButton").prop("disabled", art.iRequestMember);
    $("#iRequestYearPayButton").prop("disabled", art.iRequestMember);

    if (art.iRequestMember && art.PremiumMember)
        $("#Checkout").prop("disabled", true);
    else $("#Checkout").prop("disabled", false);

    $("#PublicListing").prop("disabled", getUserID() != art.UserID);
    $("#ShowArtist").prop("checked", art.ShowArtist);
    $("#ShowArtist").prop("disabled", bVal)
    $("#ShowCategories").prop("checked", art.ShowCategories);
    $("#ShowCategories").prop("disabled", bVal);
    $("#ShowMembers").prop("checked", art.ShowMembers);
    $("#ShowMembers").prop("disabled", bVal);
    $("#EnableDownvotes").prop("checked", art.EnableDownvotes);
    $("#EnableDownvotes").prop("disabled", bVal);
    $("#PublicListing").prop("checked", art.IsPublic);

    $("#maxMessages").val(art.MaxiMessages);
    $("#maxMessages").prop("disabled", bVal);
    $("#maxRequests").val(art.MaxiRequests);
    $("#maxRequests").prop("disabled", bVal);
    $("#ArtistName").val(art.ArtistName);
    $("#ArtistName").prop("disabled", bVal);
    $("#ArtistWebsite").val(art.Website);
    $("#ArtistWebsite").prop("disabled", bVal);
    $("#iRequestName").val(art.iRequestName);
    var mbrs = artistMembers(art.ArtistID);
    populateMemberList(mbrs);
    if (isAdmin) {
        getJoinRequests(art);
    }
    else {
        $("#joinRequests").hide();
        $("#SaveArtistProfile").hide();
    }
    var g = populateMyGenres();
    populateGenres(g);
}

function getJoinRequests(art) {
    $("#joinRequests").show();
    $("#header").text("Pending Join Requests for " + art.ArtistName);
    var lst = joinRequests(art.ArtistID);
    var html = "";
    if (lst.length < 1) {
        html = "<tr><td colspan='3'>No Pending Requests</td></tr>";
    }
    var cls = "";
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].Status == true)
            continue;
        if ((i % 2) == 0)
            cls = "even";
        else cls = "odd";
        var disAppr = "disabled='true'", disDeny = "disabled='true'";
        if (lst[i].Status === 1)
            disDeny = "";
        else if (lst[i].Status === 0)
            disAppr = "";
        else disDeny = disAppr = "";
        html += "<tr class='" + cls + "'><td>" + lst[i].Username + "</td><td>" + lst[i].FirstName + " " + lst[i].LastName + "</td>";
        html += "<td><button " + disAppr + " data-requestid='" + lst[i].JoinRequestID + "' class='approve square-button button-small buttonColor'><span class='mif-checkmark'></span></button>&nbsp;&nbsp;";
        html += "<button " + disDeny + " data-requestid='" + lst[i].JoinRequestID + "' class='deny button-small square-button buttonColor'><span class='mif-cross'></span></button>&nbsp;&nbsp;";
        html += "<button data-requestid='" + lst[i].JoinRequestID + "' class='remove button-small square-button buttonColor'><span class='mif-bin'></span></button>&nbsp;";
        html += "</td></tr>";
        html += "<tr class='" + cls + "'><td colspan='3'>Message: <input type='text' class='message' data-requestid='" + lst[i].JoinRequestID + "'/>&nbsp;";
        html += "Role: <select multiple style='display:inline' class='artistRole'  data-requestid='" + lst[i].JoinRequestID + "'>" + getRoles(lst[i].UserID) + "</select></td>";
        html += "</tr>"
    }
    $("#reqBdy").html(html);
}
function getRoles(id) {
    var roles = instrumentByUser(id);
    if (!roles)
        return;
    var t = "";
    for (var i = 0; i < roles.length; i++) {
        t += "<option value='" + roles[i].InstrumentID + "'>" + roles[i].InstrumentName + "</option>";
    }
    return t;
}
function populateMemberList(mbrs, bVal) {
    $("#memberList").html("");
    if (!mbrs)
        return;

    var html = "<table style=width:100%>";
    $.each(mbrs, function (i, v) {
        html += "<tr><td style='width:25%'>" + v.User.FirstName + "  " + v.User.LastName + "</td><td style='width:70%'>" + v.ArtistRole + "</td>";
        if (art.UserID == getUserID())
            html += "<td style='vertical-align:top'><a href='#' class='removeMember' disabled='" + bVal + "' title='Remove this member' data-userid='" + v.User.UserID + "' data-artistid='" + v.ArtistID + "'>x</a></tr>";
        else html += "<td></td></tr>";
    });
    $("#memberList").html(html);
}