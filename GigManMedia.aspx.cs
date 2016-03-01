using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;

public partial class GigManMedia : System.Web.UI.Page
{
    string adid = "";
    protected void Page_Load(object sender, EventArgs e)
    {
        UploadStatusLabel.Text = "";
        string action = Request.QueryString.Get("Action");
        string skin = Request.QueryString.Get("skin");
        if (string.IsNullOrEmpty(skin))
            skin = "neon";
        gmStyle.Attributes.Add("href", "css/ads-" + skin + ".min.css");
        if (action == "Error")
        {
            switch (Request.QueryString.Get("type"))
            {
                case "exceed": UploadStatusLabel.Text = "The file you are trying to upload exceeds the size limit.";
                    return;
                    break;
            }
        }
        fakeText.Text = mediaFiles.FileName;
        if (action == "Upload")
        {
            UploadPanel.Visible = true;
            adid = Request.QueryString.Get("WantAdID");
        }
        else if (action == "DeleteMedia")
        {
            adid = Request.QueryString.Get("WantAdMediaID");
            DeleteMedia(adid);
        }
    }
    private void DeleteMedia(string mediaID)
    {
        string path = "Uploads/";
        if (path != "")
        {
            try
            {
                DeleteFile(path + "", mediaID);
                DeleteFile(path + "", mediaID);
            }
            catch (Exception ex)
            {
                UploadStatusLabel.Text = ex.Message;
            }
        }
    }
    private void DeleteFile(string path, string id)
    {
        string diskPath = Server.MapPath(path);

        foreach (string fname in System.IO.Directory.GetFiles(diskPath, id + ".*"))
        {
            if (System.IO.File.Exists(fname))
            {
                System.IO.File.Delete(fname);
            }
        }
    }
    protected void Submit_Click(object sender, EventArgs e)
    {
        // Before attempting to perform operations
        // on the file, verify that the FileUpload 
        // control contains a file.
        if (mediaFiles.HasFile || mediaFiles.HasFiles)
        {
            foreach (HttpPostedFile uploadedFile in mediaFiles.PostedFiles)
            {
                if (uploadedFile.ContentType.IndexOf("image") == 0)
                    if (uploadedFile.ContentType.IndexOf("/gif") < 0 && uploadedFile.ContentType.IndexOf("/jpeg") < 0 && uploadedFile.ContentType.IndexOf("/png") < 0)
                    {
                        UploadStatusLabel.Text += "Files of type " + uploadedFile.ContentType.Substring(uploadedFile.ContentType.IndexOf("/")+1) + 
                            " are not allowed. Allowed image types are JPG, GIF and PNG.<br/>";
                        continue;
                    }
                if (uploadedFile.ContentType.IndexOf("audio") == 0)
                    if (uploadedFile.ContentType.IndexOf("/mp3") < 0 && uploadedFile.ContentType.IndexOf("/wav") < 0)
                    {
                        UploadStatusLabel.Text += "Files of type " + uploadedFile.ContentType.Substring(uploadedFile.ContentType.IndexOf("/")+1) + 
                            " are not allowed. Allowed audio types are MP3 and WAV.<br/>";
                        continue;
                    }
                if (uploadedFile.ContentLength > 4000000)
                {
                    UploadStatusLabel.Text += uploadedFile.FileName + " exceeds the maximum size of 4mb.<br/>";
                    continue;
                }
                string id = getNextID();
                string ext = uploadedFile.FileName.Substring(uploadedFile.FileName.LastIndexOf(".") + 1).ToUpper();
                string mid = AddMediaFile(ext,id);
                if (string.IsNullOrEmpty(mid))
                {
                    UploadStatusLabel.Text += "There has been an error adding your media.  Please try again in a few minutes.<br/>If the problem persists, please contact support.";
                }
                string savepath = "",savePathThumb = "", savePathList = "";
                if (ext == "JPG" || ext == "JPEG" || ext == "PNG")
                {
                    savePathThumb = "uploads\\thumbs\\" + mid + "." + ext;
                    savePathList = "uploads\\AdList\\" + mid + "." + ext;
                    savepath = "uploads\\" + mid + "." + ext;
                }
                else if (ext == "WAV" || ext == "MP3")
                    savepath = "uploads\\" + mid + "." + ext;
                try
                {
                    uploadedFile.SaveAs(Server.MapPath("~/uploads") + "/" + id + "." + ext);
                    if (uploadedFile.ContentType.IndexOf("image") > -1)
                        saveThumbs(id,ext);                    
                }
                catch (Exception ex)
                {
                    UploadStatusLabel.Text = ex.Message;
                }
            }
        }
        else
        {
            // Notify the user that a file was not uploaded.
            UploadStatusLabel.Text = "You did not specify a file to upload.";
        }
    }
    void saveThumbFile(int mH, int mW, string path,System.Drawing.Image img)
    {
        int nH, nW, oH = img.Height, oW = img.Width;
        if (mH < img.Height || mW < img.Width)
        {
            nH = (oH * mW) / oW;
            nW = mW;

            if (oH > oW)
            {
                nW = (oW * mH) / oH;
                nH = mH;
            }
        }
        else
        {
            nW = img.Width;
            nH = img.Height;
        }
        System.Drawing.Bitmap bmp = new System.Drawing.Bitmap(img, nW, nH);
        System.IO.MemoryStream stream = new System.IO.MemoryStream();
        bmp.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
        bmp.Save(path);
    }
    void saveThumbs(string id, string ext)
    {
        System.Drawing.Image img = System.Drawing.Image.FromFile(Server.MapPath("~/uploads") + "/" + id + "." + ext);
        saveThumbFile(64,64,Server.MapPath("~/uploads/thumbs") + "/" + id + ".png",img);
        saveThumbFile(170,280,Server.MapPath("~/uploads/adlist") + "/" + id + ".png",img);
        saveThumbFile(750,750,Server.MapPath("~/uploads") + "/" + id + ".png",img);

    }
    string getNextID()
    {
        DataTable dataTable = null;
        string cnn = System.Configuration.ConfigurationManager.ConnectionStrings["MSSQLConnection"].ConnectionString;
        using (SqlConnection connection = new SqlConnection(cnn))
        {
            connection.Open();
            try
            {
                List<SqlParameter> parms = new List<SqlParameter>();
                parms.Add(new SqlParameter("@type", "media"));
                
                dataTable = new DataTable();
                SqlCommand command = new SqlCommand("NextID", connection);
                command.CommandType = CommandType.StoredProcedure;
                if (parms != null)
                    command.Parameters.AddRange(parms.ToArray());
                //command.ExecuteNonQuery();
                SqlDataAdapter da = new SqlDataAdapter(command);
                da.Fill(dataTable);
                
            }
            catch (Exception Exception)
            {
                UploadStatusLabel.Text = Exception.Message;
                return null;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    connection.Close();
            }
            return dataTable.Rows[0][0].ToString();
        }
    }
    string AddMediaFile(string fExt,string id)
    {
        string cnn = System.Configuration.ConfigurationManager.ConnectionStrings["MSSQLConnection"].ConnectionString;
        string mtyp = "", cnt = "";
        int typ = 0;
        switch (fExt.ToUpper())
        {
            case "JPG": typ = 1; mtyp = "Image"; cnt = "8"; break;
            case "JPEG": typ = 2; mtyp = "Image"; cnt = "8"; break;
            case "GIF": typ = 3; mtyp = "Image"; cnt = "8"; break;
            case "PNG": typ = 4; mtyp = "Image"; cnt = "8"; break;
            case "WAV": typ = 5; mtyp = "Audio"; cnt = "2"; break;
            case "MP3":typ = 6;mtyp = "Audio"; cnt = "2"; break;
        }
        DataTable dataTable = null;

        using (SqlConnection connection = new SqlConnection(cnn))
        {
            connection.Open();
            try
            {
                List<SqlParameter> parms = new List<SqlParameter>();
                parms.Add(new SqlParameter("@MediaID", id));
                parms.Add(new SqlParameter("@ismain",false));
                parms.Add(new SqlParameter("@name",id+"." + fExt));
                parms.Add(new SqlParameter("@type",typ));
                parms.Add(new SqlParameter("@adid",adid));
                parms.Add(new SqlParameter("@url",""));

                dataTable = new DataTable();
                SqlCommand command = new SqlCommand("wantadmediasave", connection);
                command.CommandType = CommandType.StoredProcedure;
                if (parms != null)
                    command.Parameters.AddRange(parms.ToArray());
                //command.ExecuteNonQuery();
                SqlDataAdapter da = new SqlDataAdapter(command);
                da.Fill(dataTable);
                if (dataTable.Rows[0][0].ToString() == "-1")
                    UploadStatusLabel.Text = "Media of type <i>" + mtyp + "</i> are limited to a maximum of " + cnt + " files.";
                else
                {
                    Page.ClientScript.RegisterStartupScript(this.GetType(), "alert", "parent.loadAd();", true);
                }
            }
            catch (Exception Exception)
            {
                UploadStatusLabel.Text = Exception.Message;
                return null;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                    connection.Close();
            }
            return dataTable.Rows[0][0].ToString();
        }
    }
}