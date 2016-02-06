<%@ Page Language="C#" AutoEventWireup="true" CodeFile="GigManMedia.aspx.cs" Inherits="GigManMedia" %>
<html>
<head>
    <title></title>
    <link rel="stylesheet" href="css/ads.css" />
    <style>
        body { margin:0;padding:0;font-family:arial;font-size:90%;}
    </style>
</head>
<body>
    <asp:Panel runat="server" id="UploadPanel" visible="false" Width="99%">
        <form runat="server">
            <p>Allowed file types are JPG, PNG, GIF, WAV, MP3</p>
            <asp:FileUpload runat="server" id="mediaFiles" name="mediaFiles[]" allowmultiple="true"  style="float:left" />
            <asp:Button ID="Submit" runat="server" Text="Upload File(s)" style="float:right;margin-left:-1px" OnClick="Submit_Click"/><br /> <br />     
            <asp:Label ID="UploadStatusLabel" runat="server"></asp:Label>
        </form>
    </asp:Panel>
    <script>
        function loadAd() {
            parent.loadAd();
        }
    </script>
</body>
</html>