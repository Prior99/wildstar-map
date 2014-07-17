function Index(ul) {
    $.ajax({
        url : "index.json",
        success : function(obj) {
            for(var i in obj) {
                (function(map) {
                    var link = $("<a href='#'>" + map.name + "</a>").click(function(e) {
                        ShowMap(map.folder);
                        e.preventDefault();
                    }).appendTo($("<li></li>").appendTo(ul));
                })(obj[i]);
            }
        }
    });
}
