socket.on('message', (obj)=>{
    console.log("receive:",obj);
    appendMsg(obj);
});
socket.on('delMsg', (obj) =>{
    console.log("Delete:", obj);
    rmMsgEle(obj.id);
});
var msgCnt = 0
var appendMsg = function(obj){
    var msg = obj.msg;
    var node = document.getElementById('msgBox');
    var pNode = document.createElement('p');
    pNode.id = obj.id;
    msgCnt++;
    pNode.innerHTML = msg;
    pNode.value = true;
    console.log(pNode);
    pNode.onclick = deleteMsg(pNode.id);
    node.prepend(pNode);
    console.log("append:",msg);
}

var rmMsgEle = function(id) {
    var ele = document.getElementById(id);
    ele.remove();
}
var deleteMsg = function(id){
    return function(){
        console.log(id);
        $.ajax({
            url: '/api/msg',
            type: 'DELETE',
            data:{
                _id:id
            },
            success: (res) => {
                console.log(res);
                if(res.code===200)
                    console.log("valid delete");
                else
                    alert('You cannot do that!');
            }
        });
    }
}
var sendMsg = function(event){
    if(event.keyCode != 13) {
        return false;
    }
    var msg = document.getElementById('msgInput').value;
    console.log("send: ",msg);
    $.post({
        url: '/api/msg',
        type:'POST',
        data: {
            msg:msg,
        },
        error: (xhr) => {
            console.log(xhr, 'error');
        },
        success: (res) => {
            console.log(res);
        }
    });
}

