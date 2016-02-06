<%@ Page Language="C#" AutoEventWireup="true" CodeFile="uploader.aspx.cs" Inherits="uploader" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1" runat="server">
    <link rel="stylesheet" id="skin" runat="server" />
    <title></title>
    <script src="Scripts/jquery-2.1.4.min.js"></script>
    <style>
        html, body {
            width:100%;
            margin:0;
            padding:0;
            border:0;
        }
        .fileInput {
            -moz-opacity:0 ;
	        filter:alpha(opacity: 0);
            opacity:0;
            z-index:2;
            left:0;
            top:0;
            position:absolute;
            text-align:right;
        }
        .fakeFileInput{
            position: absolute;
	        top: 0px;
	        left: 0px;
	        z-index: 1;
        }
        .fakeFileInput button {
            margin-left:-3px;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <input type="hidden" id="ftype" runat="server"/>
        <input type="hidden" id="savedname" runat="server" />
    <div>
        <br /><label runat="server" id="accepted" style="margin-bottom:5px;font-size:smaller;display:inline-block">JPG,GIF,PNG and TIFF are accepted<br /></label><br />
        <div style="position:relative">
            <asp:FileUpload ID="FileUpload1" runat="server" onchange="this.form.submit()" CssClass="fileInput"/>
            <div class="fakeFileInput">
                <asp:TextBox runat="server" id="fakeText"/><button id="messgeButton">Browse</button>
            </div>
        </div><br />
        <div id="ctls" runat="server" style="top:0;position:absolute">
            <input type="button" ID="Done" runat="server" value="Done!"/>&nbsp;
            <asp:Button ID="Cancel" runat="server" OnClick="CancelClick" text="Cancel" /> 
        </div>
        <div runat="server" id="photo" style="width:100px"></div> 
        <asp:Label ID="Label1" runat="server"></asp:Label>
    </div>
 
    </form>  
    <script>
        
        $(document).ready(function () {       
            $("#Done").click(function () {
                var mssg = { name: "filename", value: "<%=savedname.Value.Substring(savedname.Value.LastIndexOf("\\") + 1)%>" };
                $("#ctls").hide();
                document.getElementById("form1").reset();
                $("#photo").html("");
                $("#FileUpload1").show();
                $("#accepted").show();
                parent.fileUploaded(mssg);
            });
        });
    </script> 
</body>
</html>
