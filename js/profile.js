"use strict";
$(document).ready(function () {
    var usr = JSON.parse(getSession("loggedinuser"));
    var uinst = usr.Instruments.replace(/ /g,"");
    var inst = instrumentList();
    
    var opts = "";
    var groupstart = false;
    
    loadGeographic(usr);
    for (var i = 0; i < inst.length; i++) {
        var pad = "";
        if (inst[i].Parent == 0)
        {
            if (groupstart) opts += "</optgroup>";
            opts +="<optgroup value='" + inst[i].InstrumentID + "' label='" + inst[i].Name + "'>";
            groupstart = true;
        }
        else opts += "<option value='" + inst[i].InstrumentID + "'>" + pad + inst[i].Name + "</option>";
    }
    $("#Instruments").append(opts);

    $("#Instruments").val(uinst.split(","));

    $("#status").text(usr.Active ? "Active" : "Inactive");
    var jDt = eval("new " + usr.CreationDate.replace("/", "").replace("/", "").substring(0, usr.CreationDate.indexOf("-") - 1) + ")");
    $("#joinDate").text(jDt.getMonth() + 1 + "/" + jDt.getDate() + "/" + jDt.getFullYear());
    var aa = getArtistAffiliationList();
    getAllArtists(aa);
    getPendingJoinRequests();
    if ($("#joinArtistList option").length == 0) {
        $("#joinArtistList").prop("disabled", true);
        $("#joinRequestSend").prop("disabled", true);
    }
    $("#instrumentPanel").accordion();
    $("#userName").text(usr.Username);
    $("#Email").val(usr.Email);
    $("#FirstName").val(usr.FirstName);
    $("#ArtistRole").val(usr.Role);
    $("#LastName").val(usr.LastName);

    $("#joinRequestSend").click(function () {
        var uid = getUserID();
        var aid = $("#joinArtistList").val();
        joinRequestCreate(uid, aid);
    });
    $("button[type='submit']").click(function () {
        var pw1 = $("#password").val(),
            pw2 = $("#password2").val();
        if (pw1 != pw2) {
            addError("The passwords do not match.");
            return;
        }
        var inst = "";
        $('#Instruments :selected').each(function (i, selected) {
            inst += $(selected).val() +",";            
        });
        if (!inst)
            inst = "";
        if (inst.indexOf(",") > -1)
            inst = inst.replace(/,([^,]*)$/,'$1');
        if ($("#FirstName").text().trim() == "" || $("#LastName").text().trim() == "")
            addError("First Name and Last Name are required.");
        if ($("#Email").text().trim() == "")
            addError("Email address is required.");
        if ($("#country").val() == "")
            addError("Country is a required field.");
        if ($("#country").val() == "CA" || $("#country").val() == "US" && $("#state").val() == "")
            addError("State is a required field.");
        if ($("#city").val().trim() == "")
            addError("City is a required field.");
        if ($("#country").val() == "CA" || $("#country").val() == "US" && $("#postalCode").val() == "")
            addError("Postal Code is a required field.");
        if (!userUpdate(getUserID(), $("#FirstName").val(), $("#LastName").val(), $("#Email").val(), "", $("#Password").val(), inst,
            $("#country").val(),$("#state").val(),$("#city").val(),$("#postalCode").val()).Error)
        {
            usr.FirstName = $("#FirstName").val();
            usr.LastName = $("#LastName").val();
            usr.Email = $("#Email").val();
            usr.Instruments = inst;
            sessionStorage.setItem("loggedinuser", JSON.stringify(usr))
        }
    });
    $(document).on("click", ".msgChk", function () {
        updateUserArtistMessaging($(this).data("userartistid"), $(this).prop("checked"));
    })
    
});
function loadGeographic(usr) {
    if (usr.Country != "US" && usr.Country != "CA")
        $("#statePanel").hide();
    var cnt = countries();
    var st = states(usr.Country);
    var opts = "<option></option>";
    for (var i = 0; i < cnt.length; i++)
    {
        var sel = "";
        if (cnt[i].Code == usr.Country) sel = " selected ";
        opts += "<option value='" + cnt[i].Code + "'" + sel + ">" + cnt[i].Name + "</option>";
    }
    //$("#country").chosen();
    $("#country").append(opts);
    //$("#country").trigger("chosen:updated");
    opts = "<option></option>";
    for (var i = 0; i < st.length; i++)
    {
        var sel = "";
        if (st[i].Name == usr.State) sel = " selected ";
        opts += "<option value='" + st[i].Name + "'" + sel + ">" + st[i].Name + "</option>";
    }
    //$("#state").chosen();
    $("#state").append(opts);
    //$("#state").trigger("chosen:updated");
    $("#city").val(usr.City);
    $("#postalCode").val(usr.PostalCode);
}

function addError(err) {
    var txt = $("#Error").html();
    if (txt == "")
        txt = err;
    else txt += "<br/>" + err;
    $("#Error").html(txt);
}
function getAllArtists(aa) {
    var al = artistsAll();
    $("#artistList").append("<option value=''></option>");
    for (var i = 0; i < al.length; i++) {
        if (aa && contains(aa, al[i].ArtistName))
            continue;
        var o = "<option value='" + al[i].ArtistID + "'>" + al[i].ArtistName + "</option>";
        $("#joinArtistList").append(o);
    }
}
function contains(lst, name) {
    for (var i = 0; i < lst.length; i++)
        if (lst[i].Artist.ArtistName == name)
            return true;
    return false;
}
function getArtistAffiliationList() {
    var html = "";
    var lst = artistAffiliations(getUserID());
    for (var i = 0; i < lst.length; i++) {
        html += "<tr><td>" + lst[i].Artist.ArtistName + "</td><td>" + lst[i].Instrument + "</td>";
        var chk = lst[i].AllowMessaging ? " checked " : "";
        html += "<td><input class='msgChk' type='checkbox' data-userartistid='" + lst[i].UserArtistID + "'" + chk + "/></td></tr>";
    }
    $("#RoleTable tbody").html(html);
    return lst;
}
function getPendingJoinRequests() {
    var lst = joinRequestsByUserID(getUserID());
    var html = "";
    for (var i = 0; i < lst.length; i++) {
        if (lst[i].Status == 1)
            continue;
        html += "<tr><td>" + lst[i].ArtistName + "</td><td>";
        if (lst[i].Status == -1)
            html += "Pending";
        else if (lst[i].Status == 0)
            html += "Denied";
        else html += "Denied";
        html += "</td></tr>";
    }
    var oHtml = $("#RoleTable tbody").html();
    if (oHtml)
        html = oHtml + html;
    $("#RoleTable tbody").html(html);
}