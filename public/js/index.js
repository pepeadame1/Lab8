let insertPost = $("#insertPost");
let deletePost = $("#deletePost");
let updatePost = $("#updatePost");

function init(){
    let url = "http://localhost:8080/blog-posts";

    $.ajax({
        url: url,
        method: "GET",
        success: function(result){
            
            list = $(".listOfPosts")[0];
            $(list).html("");

            result.forEach(element => {
                title = element["title"];
                desc = element["content"];
                author = element["author"];

                $(list).append("<li> <div>" + 
                                    "<p>Title: " + title + "</p>" +
                                    "<p>Content: " + desc + "</p>" +
                                    "<p>Author: " + author + "</p>" +
                                "</div> </li>");
            });

        }
    });
}

init();

insertPost.on("click", event =>{
    event.preventDefault()
    let post = {
        title: $(".title")[0].value,
        content: $(".content")[0].value,
        author: $(".author")[0].value
    }
    
    $.ajax({
        url: "http://localhost:8080/blog-posts",
        method: "POST",
        dataType: "JSON",
        contentType: "application/json",
        data: JSON.stringify(post),
        success: () =>{
            init();
        }
    });

});

deletePost.on("click", event =>{
    event.preventDefault();
    let idVal = $(".id")[0].value

    $.ajax({
        url: "http://localhost:8080/blog-posts/" + idVal,
        method: "DELETE",
        success: () =>{
            init();
        }
    })
});

updatePost.on("click", event =>{
    event.preventDefault();

    post = {
        id: $(".id")[1].value,
    }

    if($(".title")[1].value.trim().length != 0){
        post["title"] = $(".title")[1].value
    }
    if($(".content")[1].value.trim().length != 0){
        post["content"] = $(".content")[1].value
    }
    if($(".author")[1].value.trim().length != 0){
        post["author"] = $(".author")[1].value
    }
    

    $.ajax({
        url: "http://localhost:8080/blog-posts/" + $(".id")[1].value,
        method: "PUT",
        dataType: "JSON",
        contentType: "application/json",
        data: JSON.stringify(post),
        success: () =>{
            init();
        }
    });

});