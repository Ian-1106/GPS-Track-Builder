function download_file() {
    //藉型別陣列建構的 blob 來建立 URL
    let fileName = "path.bin";
    const data = data_to_file;
    let temp="";
    let blob = new Blob(data, {
        type: "application/octet-stream"
    });
    var href = URL.createObjectURL(blob);
    // 從 Blob 取出資料
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = href;
    link.download = fileName;
    link.click();

    add_log("路線資料下載完成","blue");
}