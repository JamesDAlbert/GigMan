"use strict";
$(document).ready(function () {

    var inst = instrumentList();

    $("#Instruments").css("display", "");

    var opts = "";
    var groupstart = false;
    if (inst)
        for (var i = 0; i < inst.length; i++) {
            var pad = "";
            if (inst[i].Parent == 0) {
                if (groupstart) opts += "</optgroup>";
                opts += "<optgroup value='" + inst[i].InstrumentID + "' label='" + inst[i].Name + "'>";
                groupstart = true;
            }
            else opts += "<option value='" + inst[i].InstrumentID + "'>" + pad + inst[i].Name + "</option>";
        }
    $("#Instruments").append(opts);

    loadGeographic();
    $("button[type='submit']").click(function () {
        $("#Error").text("");
        var pw1 = $("#password").val(),
            pw2 = $("#password2").val();
        if (pw1.trim() == "" || pw1 != pw2) {
            if (pw1 != pw2) addError("The passwords do not match."); else addError("Password is required.");
            $("#Error").css("display","inline-block");
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
        if ($("#Username").val().trim() == "")
            addError("Username is required.");
        if ($("#FirstName").val().trim() == "" || $("#LastName").val().trim() == "")
            addError("First Name and Last Name are required.");
        if ($("#Email").val().trim() == "")
            addError("Email address is required.");
        if ($("#country").val() == "")
            addError("Country is a required field.");
        if (($("#country").val() == "CA" || $("#country").val() == "US") && $("#state").val() == "")
            addError("State is a required field.");
        if ($("#city").val().trim() == "")
            addError("City is a required field.");
        if (($("#country").val() == "CA" || $("#country").val() == "US") && $("#postalCode").val() == "")
            addError("Postal Code is a required field.");
        
        var res = userExists($("#Username").val().trim(), $("#Email").val().trim());
        if (res == 1)
            addError("That username is already in use.");
        if (res == 2)
            addError("That email address is already in use.");
        if (res == 3)
            addError("That username and email address are already in use.");
        if ($("#Error").text().trim() != "") {
            $("#Error").css({"background-color":"maroon", "color":"white", "display":"inline-block" });
            return;
        }
        if (res == 0 && $("#Error").text().trim() == "") {
            var u = userCreate($("#Username").val(), $("#password").val(), $("#FirstName").val(), $("#LastName").val(), $("#Email").val(), '',
                inst, $("#country").val(), $("#state").val(), $("#city").val(), $("#postalCode").val());
            if (!u.CreationError && !u.Error) {
                $("#Error").css({ "background-color": "green", "color": "white", "display": "inline-block" });
                $("#Error").text("Your account has been successfully created.  A verification email has been set to your email address. Follow the instructions to activate your account and log into GigMan.");
                $("button[type='submit']").css("disabled", true);
            }
            else {
                if (u.CreationError) {
                    $("#Error").css("display", "inline-block");
                    $("#Error").text("There has been an error creating your account  Please try again in a few minutes.");
                }
            }
        }
    });
});
function loadGeographic() {
    
    var cnt = countries();
    var st = states('');
    var opts = "<option></option>";
    if (cnt)
        for (var i = 0; i < cnt.length; i++) {
            opts += "<option value='" + cnt[i].Code + "'>" + cnt[i].Name + "</option>";
        }
    $("#country").append(opts);
    opts = "<option></option>";
    if (st)
        for (var i = 0; i < st.length; i++) {
            opts += "<option value='" + st[i].Name + "'>" + st[i].Name + "</option>";
        }
    $("#state").append(opts);
}
function addError(err) {
    var txt = $("#Error").html();
    if (txt == "")
        txt = err;
    else txt += "<br/>" + err;
    $("#Error").html(txt);
}