function Index() {
    $.ajax({
        url : "index.json",
        success : function(obj) {
            for(var i in obj) {
                (function(map) {
                    var link = $("<a>" + map.name + "</a>").click(function() {
                        ShowMap(map.folder);
                    }).appendTo("body");
                })(obj[i]);
            }
        }
    });
}
